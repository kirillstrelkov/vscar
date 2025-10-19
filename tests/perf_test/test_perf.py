import time
from functools import partial

import requests
from dotenv import load_dotenv

load_dotenv()


_DATA = [
    "/cars",
    "/cars/attributes/names?text=pre",
    "/cars/attributes/values?text=Grundpreis",
    "/cars/attributes/values?text=Motorart",
]

_RUNS = 10


def my_function(url):
    requests.get(url)


def run_function_multiple_times(func, times):
    execution_times = []

    for _ in range(times):
        start_time = time.time()
        func()
        end_time = time.time()
        execution_times.append(end_time - start_time)

    return execution_times


def calculate_statistics(execution_times):
    average_time = sum(execution_times) / len(execution_times)
    min_time = min(execution_times)
    max_time = max(execution_times)
    return average_time, min_time, max_time


def _run_data(url):
    # Run the function 1000 times
    times_run = _RUNS
    times = run_function_multiple_times(
        partial(
            my_function,
            url=url,
        ),
        times_run,
    )

    # Calculate statistics
    avg, min_time, max_time = calculate_statistics(times)

    print(f"Ran the function {times_run} times, avg: {avg:.5f}, min: {min_time:.5f}, max: {max_time:.5f}, url: {url}")


def __main():
    for main_url in ["http://127.0.0.1:8000", "http://127.0.0.1:3000"]:
        for url in _DATA:
            _run_data(main_url + url)

        print()


if __name__ == "__main__":
    __main()
