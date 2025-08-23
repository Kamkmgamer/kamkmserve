# Load and Stress Testing

Establish performance baselines and catch regressions under realistic traffic.

## Tools

- k6: scriptable load testing with JS
- Artillery: quick HTTP scenarios and SLO assertions

## Example (k6)

```js
// script.js
import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  thresholds: {
    http_req_failed: ['rate<0.01'], // <1% errors
    http_req_duration: ['p(95)<500'],
  },
  stages: [
    { duration: '1m', target: 20 }, // ramp-up
    { duration: '3m', target: 20 }, // steady
    { duration: '1m', target: 0 },  // ramp-down
  ],
};

export default function () {
  const res = http.get(__ENV.TARGET || 'http://localhost:3000');
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}
```

Run:

```
k6 run -e TARGET=http://localhost:3000 script.js
```

## Example (Artillery)

```yaml
config:
  target: "http://localhost:3000"
  phases:
    - duration: 300
      arrivalRate: 10
scenarios:
  - flow:
      - get:
          url: "/"

ensure:
  - p95: [http.response_time, 500]
  - maxErrorRate: 1
```

Run:

```
artillery run plan.yml
```

## Reporting

- Capture throughput, latency percentiles (p50/p95/p99), error rate.
- Compare against SLOs and previous baselines.
