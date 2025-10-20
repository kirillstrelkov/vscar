"""CLI to measure performance of backend."""

import contextlib
import os
from dataclasses import dataclass
from enum import StrEnum
from pathlib import Path

import click
import pandas as pd
from dotenv import load_dotenv
from loguru import logger
from perf_utils import (
    ExecResult,
    get_backend_folders,
    perf_find_by_filter_through_pages,
    perf_find_by_filter_through_prices,
)

load_dotenv()

TARGET_URL = os.getenv("URL")
STARTUP_DELAY = 3


class TestType(StrEnum):
    """Test types."""

    PRICE_IN_STEPS = "price_in_steps"
    LOOP_THROUGH_PAGES = "loop_through_pages"


@dataclass
class PerfResult:
    """Performance result."""

    app: str
    test_type: str
    results: list[ExecResult]
    parallel: bool


def _run_perf_test(base_folder: str, test_type: TestType, *, parallel: bool = False) -> PerfResult:
    if test_type == TestType.PRICE_IN_STEPS:
        results = perf_find_by_filter_through_prices(parallel=parallel)
    else:
        results = perf_find_by_filter_through_pages(parallel=parallel)

    return PerfResult(
        app=base_folder,
        test_type=str(test_type),
        results=results,
        parallel=parallel,
    )


def _run_perf_test_without_server(folder: Path, *, parallel: bool = False) -> list[PerfResult]:
    logger.debug(f"Entering directory: {folder}")

    with contextlib.chdir(folder):
        base_folder = folder.name
        logger.info(f"Processing {base_folder} ...")

        return [
            _run_perf_test(base_folder, TestType.LOOP_THROUGH_PAGES, parallel=parallel),
            _run_perf_test(base_folder, TestType.PRICE_IN_STEPS, parallel=parallel),
        ]


def _save_perf_data_to_csv(results: list[PerfResult], output: Path) -> None:
    times = []
    for perf_result in results:
        test_type = perf_result.test_type
        app = perf_result.app
        parallel = perf_result.parallel

        times += [
            {
                "test_type": test_type,
                "app": app,
                "exec_time": exec_result.exec_time,
                "response_code": exec_result.response_code,
                "request_data": exec_result.request_data,
                "parallel": parallel,
            }
            for exec_result in perf_result.results
        ]

    pd.DataFrame(times).to_csv(output)
    logger.info(f"Saved data to {output}")


def _run_single_backend(directory: Path, *, force: bool, parallel: bool) -> None:
    app = directory.name
    filename = f"{app}_" + ("par" if parallel else "seq") + ".csv"
    output = Path(__file__).parent / f"data/{filename}"

    if output.exists() and not force:
        logger.warning(f"Skipping {app} because {output} already exists.")
        return

    results = _run_perf_test_without_server(directory, parallel=parallel)

    _save_perf_data_to_csv(results, output)

    for result in results:
        total = len(result.results)
        logger.info(f"Results for {result.app}, {result.test_type}, {total=}")


@click.command()
@click.option(
    "--app",
    type=click.Choice([path.name.replace("vscar-back-", "") for path in get_backend_folders()]),
    required=True,
)
@click.option("--force", is_flag=True, default=False)
@click.option("--parallel", is_flag=True, default=False)
def cli(app: str, force: bool, parallel: bool) -> None:  # noqa: FBT001
    """Measures backend APIs calls."""
    app_folder = f"vscar-back-{app}"
    directory = next(path for path in get_backend_folders() if app_folder == path.name)
    _run_single_backend(directory, force=force, parallel=parallel)


if __name__ == "__main__":
    cli()
