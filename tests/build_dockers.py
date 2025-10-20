"""Build all backend docker images."""

import sys
from subprocess import STDOUT, run

from loguru import logger

from perf_test.perf_utils import get_backend_folders


def _main() -> None:
    for folder in get_backend_folders():
        logger.info(f"Processing {folder}")
        run(
            ["make", "docker-build"],  # noqa: S607
            check=True,
            stdout=sys.stdout,
            stderr=STDOUT,
            text=True,
            cwd=folder,
        )


if __name__ == "__main__":
    _main()
