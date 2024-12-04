"""CLI to measure performance of backend."""

import time
from typing import Any, Callable

import click
import requests
from loguru import logger


def bench_func(
    function: Callable,
    *args: Any,
):
    start_time = time.time()
    function(*args)
    end_time = time.time()

    return (end_time - start_time) * 1000


def _req(method: str, url: str, json: dict | None = None):
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


def run_basic_perf(url: str) -> None:
    """Measures backend APIs calls."""
    for func, full_url, data in [
        (_get, f"{url}/cars/db/version", None),
        (
            _post,
            f"{url}/cars/findByFilter",
            {"page": 1, "limit": 5, "text": "", "attributes": []},
        ),
        (
            _post,
            f"{url}/cars/findByFilter",
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
        (_get, f"{url}/cars/attributes/values?text=Getriebeart", None),
        (_get, f"{url}/cars/attributes/names?text=", None),
        (_get, f"{url}/cars/322469", None),
        (_get, f"{url}/cars", None),
    ]:
        exec_time = bench_func(func, full_url, data)
        _log_time(exec_time, full_url)


def run_find_by_filter_perf(url: str) -> None:
    times = []
    url = f"{url}/cars/findByFilter"
    total = 5000
    limit = 100
    pages = total // limit
    for i in range(1, pages + 1):
        data = {
            "page": i,
            "limit": limit,
            "text": "",
            "attributes": [
                {
                    "name": "Grundpreis",
                    "values": [],
                    "range": {"min": 8000, "max": 50000},
                },
            ],
        }
        logger.debug("Page {}/{}", i, pages)
        exec_time = bench_func(_post, url, data)
        times.append(exec_time)

    exec_time = sum(times) / len(times)
    _log_time(exec_time, url)


@click.command()
@click.option("--url", required=True, help="The url to test")
def cli(url) -> None:
    """Measures backend APIs calls."""
    url = url.strip("/")
    run_basic_perf(url)
    run_find_by_filter_perf(url)


if __name__ == "__main__":
    cli()
