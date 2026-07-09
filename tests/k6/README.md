# k6 Grafana Performance Test Suite

This directory contains performance tests for VSCar written using [k6](https://k6.io/). It mirrors the Python performance test suite found in `tests/perf_test/`.

## Scenarios

The suite contains two performance scenarios:

1. **`basic`**: Runs 7 sequential requests targeting various endpoints (`GET /cars`, `POST findByFilter`, metadata version checks). This corresponds to `perf_basic_requests` in the Python suite.
2. **`filter_prices`**: Sequentially queries the `/cars/findByFilter` endpoint across 421 specific price ranges (from `8000` to `50000` in steps of `100` Euro). This corresponds to `perf_find_by_filter_through_prices`.

## Configuration

You can configure the execution using the following environment variables:

- **`URL`** or **`BACKEND_URL`**: Target backend URL (defaults to `http://localhost:3000`).
- **`VUS`**: Number of virtual users to parallelize the price queries (defaults to `10`).

---

## Installation & Execution

### 1. Install k6

See [k6 Installation Guide](https://k6.io/docs/getting-started/installation/).

### 2. Run Tests

From the `tests/k6/` directory:

- **Run the performance benchmark (with 10 parallel VUs):**

  ```bash
  make test
  ```

---

## Results

```bash
make test
K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_PERIOD=100ms K6_WEB_DASHBOARD_EXPORT=html-report.html k6 run performance_suite.js

         /\      Grafana   /‾‾/
    /\  /  \     |\  __   /  /
   /  \/    \    | |/ /  /   ‾‾\
  /          \   |   (  |  (‾)  |
 / __________ \  |_|\_\  \_____/


     execution: local
        script: performance_suite.js
 web dashboard: http://127.0.0.1:5665
        output: -

     scenarios: (100.00%) 2 scenarios, 11 max VUs, 10m30s max duration (incl. graceful stop):
              * basic: 1 iterations shared among 1 VUs (maxDuration: 10m0s, exec: basicRequests, gracefulStop: 30s)
              * filter_prices: 421 iterations shared among 10 VUs (maxDuration: 10m0s, exec: filterPrices, gracefulStop: 30s)



  █ TOTAL RESULTS

    checks_total.......: 428     155.369133/s
    checks_succeeded...: 100.00% 428 out of 428
    checks_failed......: 0.00%   0 out of 428

    ✓ status is 200 or 201

    CUSTOM
    filter_prices_duration.........: avg=64.09ms min=1.71ms  med=59.53ms max=180.55ms p(90)=125.97ms p(95)=142.97ms

    HTTP
    http_req_duration..............: avg=63.86ms min=827.5µs med=56.43ms max=225.28ms p(90)=126.08ms p(95)=143.41ms
      { expected_response:true }...: avg=63.86ms min=827.5µs med=56.43ms max=225.28ms p(90)=126.08ms p(95)=143.41ms
    http_req_failed................: 0.00%  0 out of 428
    http_reqs......................: 428    155.369133/s

    EXECUTION
    iteration_duration.............: avg=64.88ms min=1.74ms  med=60.06ms max=350.64ms p(90)=126.38ms p(95)=143.71ms
    iterations.....................: 422    153.191061/s
    vus............................: 10     min=10       max=10
    vus_max........................: 11     min=11       max=11

    NETWORK
    data_received..................: 209 MB 76 MB/s
    data_sent......................: 109 kB 39 kB/s




running (00m02.8s), 00/11 VUs, 422 complete and 0 interrupted iterations
basic         ✓ [======================================] 1 VUs   00m00.4s/10m0s  1/1 shared iters
filter_prices ✓ [======================================] 10 VUs  00m02.8s/10m0s  421/421 shared iters

```
