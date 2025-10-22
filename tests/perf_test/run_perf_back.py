"""CLI to measure performance of backend."""

import contextlib
import os
from dataclasses import dataclass
from pathlib import Path

import click
import pandas as pd
from dotenv import load_dotenv
from loguru import logger
from perf_utils import (
    ExecResult,
    get_backend_folders,
    perf_find_by_filter_through_prices,
)

load_dotenv()

TARGET_URL = os.getenv("URL")
STARTUP_DELAY = 3


@dataclass
class PerfResult:
    """Performance result."""

    app: str
    results: list[ExecResult]
    parallel: bool


def _run_perf_test(base_folder: str, *, parallel: bool = False) -> PerfResult:
    results = perf_find_by_filter_through_prices(parallel=parallel)

    return PerfResult(
        app=base_folder,
        results=results,
        parallel=parallel,
    )


def _run_perf_test_without_server(folder: Path, *, parallel: bool = False) -> PerfResult:
    logger.debug(f"Entering directory: {folder}")

    with contextlib.chdir(folder):
        base_folder = folder.name
        logger.info(f"Processing {base_folder} ...")

        return _run_perf_test(base_folder, parallel=parallel)


def _save_perf_data_to_csv(results: list[PerfResult], output: Path) -> None:
    times = []

    for result in results:
        app = result.app
        parallel = result.parallel

        times += [
            {
                "app": app,
                "exec_time": exec_result.exec_time,
                "response_code": exec_result.response_code,
                "request_data": exec_result.request_data,
                "parallel": parallel,
            }
            for exec_result in result.results
        ]

    pd.DataFrame(times).to_csv(output)
    logger.info(f"Saved data to {output}")


def _run_single_backend(directory: Path, *, force: bool) -> None:
    app = directory.name
    filename = f"{app}.csv"
    output = Path(__file__).parent / f"data/{filename}"

    if output.exists() and not force:
        logger.warning(f"Skipping {app} because {output} already exists.")
        return

    results = [
        _run_perf_test_without_server(directory, parallel=False),
        _run_perf_test_without_server(directory, parallel=True),
    ]

    _save_perf_data_to_csv(results, output)

    for result in results:
        total = len(result.results)
        parallel = result.parallel
        logger.info(f"Results for {result.app}, {parallel=}, {total=}")


@click.command()
@click.option(
    "--app",
    type=click.Choice([path.name.replace("vscar-back-", "") for path in get_backend_folders()]),
    required=True,
)
@click.option("--force", is_flag=True, default=False)
def cli(app: str, force: bool) -> None:  # noqa: FBT001
    """Measures backend APIs calls."""
    app_folder = f"vscar-back-{app}"
    directory = next(path for path in get_backend_folders() if app_folder == path.name)
    _run_single_backend(directory, force=force)


if __name__ == "__main__":
    cli()
