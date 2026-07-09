import http from 'k6/http';
import { check } from 'k6';
import exec from 'k6/execution';
import { Trend } from 'k6/metrics';

const TARGET_URL = __ENV.BACKEND_URL || __ENV.URL || 'http://localhost:3000';

// Number of price queries from 8000 EUR to 50000 EUR in steps of 100 EUR.
// Total steps = ((50000 - 8000) / 100) + 1 = 421 iterations.
const PRICE_RANGE_STEPS = 421;

const filterPricesDuration = new Trend('filter_prices_duration', true);

export const options = {
  scenarios: {
    basic: {
      executor: 'shared-iterations',
      exec: 'basicRequests',
      vus: 1,
      iterations: 1,
    },
    filter_prices: {
      executor: 'shared-iterations',
      exec: 'filterPrices',
      vus: __ENV.VUS ? parseInt(__ENV.VUS, 10) : 10,
      iterations: PRICE_RANGE_STEPS,
    },
  },
};

const params = {
  headers: {
    'Content-Type': 'application/json',
  },
};

export function basicRequests() {
  const reqs = [
    { method: 'GET', url: 'cars/db/version', data: null },
    {
      method: 'POST',
      url: 'cars/findByFilter',
      data: JSON.stringify({ page: 1, limit: 5, text: '', attributes: [] }),
    },
    {
      method: 'POST',
      url: 'cars/findByFilter',
      data: JSON.stringify({
        page: 1,
        limit: 5,
        text: '',
        attributes: [
          {
            name: 'Grundpreis',
            values: [],
            range: { min: 7990, max: 39531 },
          },
        ],
      }),
    },
    { method: 'GET', url: 'cars/attributes/values?text=Getriebeart', data: null },
    { method: 'GET', url: 'cars/attributes/names?text=', data: null },
    { method: 'GET', url: 'cars/322469', data: null },
    { method: 'GET', url: 'cars', data: null },
  ];

  for (const r of reqs) {
    const fullUrl = `${TARGET_URL}/${r.url}`;
    let res;
    if (r.method === 'GET') {
      res = http.get(fullUrl);
    } else {
      res = http.post(fullUrl, r.data, params);
    }
    check(res, {
      'status is 200 or 201': (res) => res.status === 200 || res.status === 201,
    });
  }
}

export function filterPrices() {
  const minPrice = 8000;
  const step = 100;

  // iterationInTest goes from 0 to 420
  const index = exec.scenario.iterationInTest;
  const rangeStart = minPrice + (index * step);

  const payload = JSON.stringify({
    page: 1,
    limit: 100,
    text: '',
    attributes: [
      {
        name: 'Grundpreis',
        values: [],
        range: { min: rangeStart, max: rangeStart + step },
      },
    ],
  });

  const res = http.post(`${TARGET_URL}/cars/findByFilter`, payload, params);

  filterPricesDuration.add(res.timings.duration);

  check(res, {
    'status is 200 or 201': (res) => res.status === 200 || res.status === 201,
  });
}
