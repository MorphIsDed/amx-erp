import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 500 },  // Ramp-up to 500 users over 2 minutes
    { duration: '5m', target: 2000 }, // Ramp-up to 2000 users over 5 minutes
    { duration: '3m', target: 2000 }, // Steady state of 2000 users
    { duration: '2m', target: 0 },    // Ramp-down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<300'], // 95% of requests must complete below 300ms
    http_req_failed: ['rate<0.01'],   // Error rate must be less than 1%
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3001';
const WEB_URL = __ENV.WEB_URL || 'http://localhost:3000';

export default function () {
  // Test the API Health
  const apiRes = http.get(`${BASE_URL}/health/live`);
  check(apiRes, {
    'api is healthy': (r) => r.status === 200,
  });

  // Test Web Dashboard SSR
  const webRes = http.get(`${WEB_URL}/`);
  check(webRes, {
    'web is accessible': (r) => r.status === 200,
  });

  // Add realistic user think time
  sleep(Math.random() * 2 + 1);
}
