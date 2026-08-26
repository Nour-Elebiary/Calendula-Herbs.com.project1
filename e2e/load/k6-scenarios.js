import http from 'k6/http';
import { check, sleep } from 'k6';

// IMPORTANT: localhost only — NEVER point this at the Railway URL
const BASE_URL = 'http://localhost:3000';

export const options = {
  scenarios: {
    homepage_ramp: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 50 },
        { duration: '1m', target: 100 },
        { duration: '30s', target: 0 },
      ],
      gracefulRampDown: '10s',
    },
    api_public_spike: {
      executor: 'constant-arrival-rate',
      rate: 20,
      timeUnit: '1s',
      duration: '30s',
      preAllocatedVUs: 50,
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const res1 = http.get(`${BASE_URL}/`);
  check(res1, { 'homepage 200': (r) => r.status === 200 });
  sleep(1);

  const res2 = http.get(`${BASE_URL}/api/public/products`);
  check(res2, { 'products API 200': (r) => r.status === 200 });
  sleep(1);

  // Contact form — rate limit should activate (429), not crash (500)
  const res3 = http.post(`${BASE_URL}/api/public/contact`, JSON.stringify({
    name: 'Load Test', email: 'load@test.com', message: 'Test', subject: 'Test',
  }), { headers: { 'Content-Type': 'application/json' } });
  check(res3, {
    'contact form: 200 or 429 only': (r) => [200, 429].includes(r.status),
  });
  sleep(1);
}
