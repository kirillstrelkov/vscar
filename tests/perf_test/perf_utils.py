"""Utilities to measure performance of backend."""

import os
import sys
import time
from collections.abc import Callable
from dataclasses import dataclass
from functools import partial
from multiprocessing import Pool, cpu_count
from pathlib import Path
from typing import Any

import click
import requests
from dotenv import load_dotenv
from loguru import logger

load_dotenv()

TARGET_URL = os.getenv("URL")

MAKEFILE_NAME = "Makefile"


@dataclass
class ExecResult:
    """Single execution result."""

    exec_time: float
    response_code: int
    request_data: str


def get_db_version() -> str:
    """Get database version."""
    return _get(f"{TARGET_URL}/cars/db/version", None).text


def _req(method: str, url: str, json: dict | None = None) -> requests.Response:
    """Perform HTTP request and checks for errors."""
    response = requests.request(method, url, json=json, timeout=100)
    if response.status_code not in {
        requests.status_codes.codes.OK,
        requests.status_codes.codes.CREATED,
    }:
        logger.error(f"Error: {url} {response.status_code}")
    return response


def _post(url: str, json: dict) -> requests.Response:
    return _req("POST", url, json)


def _get(url: str, json: dict | None = None) -> requests.Response:
    return _req("GET", url, json)


def _log_time(exec_time: float, url: str) -> None:
    logger.info(f"Ping {exec_time:>10.2f} ms: {url}")


def perf_basic_requests(*, parallel: bool = False) -> None:  # noqa: ARG001
    """Measure backend APIs calls."""
    results = []
    for req_func, url, data in [
        (_get, "cars/db/version", None),
        (
            _post,
            "cars/findByFilter",
            {"page": 1, "limit": 5, "text": "", "attributes": []},
        ),
        (
            _post,
            "cars/findByFilter",
            {
                "page": 1,
                "limit": 5,
                "text": "",
                "attributes": [
                    {
                        "name": "Grundpreis",
                        "values": [],
                        "range": {"min": 7990, "max": 39531},
                    },
                ],
            },
        ),
        (_get, "cars/attributes/values?text=Getriebeart", None),
        (_get, "cars/attributes/names?text=", None),
        (_get, "cars/322469", None),
        (_get, "cars", None),
    ]:
        req_url = f"{TARGET_URL}/{url}"
        result = _time_request(data, req_url, req_func=req_func)

        logger.debug(f"{req_url}: {result.exec_time:.2f} ms")

        results.append(result)

    return results


def _time_request(data: dict, url: str, *, req_func: Callable) -> ExecResult:
    """Make a POST request and time it. Must be a top-level function for pickling."""
    start_time = time.time()
    response = req_func(url, data)
    exec_time = (time.time() - start_time) * 1000
    return ExecResult(
        exec_time,
        response.status_code,
        str(data),
    )


def _run_requsts(args: list[Any], url: str, *, parallel: bool) -> list[ExecResult]:
    func = partial(_time_request, url=url, req_func=_post)

    if parallel:
        processes = cpu_count() // 2  # 50% cpu
        logger.debug(f"Running requsts with {processes} processes in parallel")
        with Pool(processes) as pool:
            results = pool.map(func, args)
    else:
        logger.debug("Running requsts sequentially")
        results = [func(arg) for arg in args]

    return results


def perf_find_by_filter_through_prices(
    *,
    range_min: int = 8000,
    range_max: int = 50000,
    parallel: bool = False,
) -> list[ExecResult]:
    """Measure backend APIs calls with price range."""
    logger.debug("Running perf_find_by_filter_through_prices")
    url = f"{TARGET_URL}/cars/findByFilter"
    limit = 100
    step = 100

    args = []
    for range_start in range(range_min, range_max + step, step):
        data = {
            "page": 1,
            "limit": limit,
            "text": "",
            "attributes": [
                {
                    "name": "Grundpreis",
                    "values": [],
                    "range": {"min": range_start, "max": range_start + step},
                },
            ],
        }
        args.append(data)

    return _run_requsts(args, url, parallel=parallel)


def get_backend_folders() -> list[Path]:
    """Find all directories containing a Makefile recursively."""
    makefiles = _get_backend_makefiles()
    return sorted([path.parent for path in makefiles])


def _get_backend_makefiles() -> list[Path]:
    """Find all directories containing a Makefile recursively."""
    repo_root = Path(__file__).resolve().parent.parent.parent
    assert (repo_root / "tests").exists()  # noqa: S101

    return [path for path in Path(repo_root).glob("back/**/" + MAKEFILE_NAME) if "node_modules" not in str(path)]


@click.command()
@click.option("--simple", is_flag=True, default=False)
def cli(*, simple: bool) -> None:
    """Measures backend APIs calls."""
    logger.remove()
    logger.add(sys.stderr, level=os.getenv("LOG_LEVEL", "INFO").upper())

    tests = [(perf_basic_requests, 7)]
    if not simple:
        tests.append(
            (perf_find_by_filter_through_prices, 421),
        )

    for func, expected_results in tests:
        logger.info(f"Testing '{func.__name__}'...")

        results = func(parallel=True)

        assert len(results) == expected_results, f"Expected {expected_results} results, got {len(results)}"  # noqa: S101
        statuses = {result.response_code for result in results}
        assert not statuses.difference({200, 201}), f"Unexpected status codes: {statuses}"  # noqa: S101

        avg_exec_time = sum(result.exec_time for result in results) / len(results)
        logger.info(f"AVG exec time for '{func.__name__}': {avg_exec_time:.2f} ms")


if __name__ == "__main__":
    cli()
