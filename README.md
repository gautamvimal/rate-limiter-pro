# Adaptive API Rate Limiter

A full-stack rate limiter project built with **Node.js + Express**, **MongoDB**, **Redis**, and **React**. It follows the requested folder structure and implements a production-style rate limiting workflow with:

- **Express middleware** enforcing per-user, per-organization, per-plan, or global limits
- **Redis sliding window logic** using sorted sets for near real-time request counting
- **MongoDB policies and usage logs** for persistence and analytics
- **Anti-thundering herd jitter** to spread delayed requests
- **Gradual backoff** before hard rejection
- **SLA-aware adaptive tuning** through a worker and shell script trigger
- **Unix socket cache status endpoint** for low-level cache communication/inspection
- **Frontend dashboard** for analytics, policy editing, and request simulation
- Example inspiration similar to **Stripe** or **Twilio** style paid API rate limiting

## Folder Structure

```text
rate-limiter/
├── server/
├── client/
├── scripts/
├── docker/
├── .env
├── README.md
└── .gitignore
```

## Core Features

### 1. Sliding Window Rate Limiting
The middleware stores each accepted request in a Redis sorted set. Old entries are removed based on the active time window, which allows smoother behavior than a fixed window counter.

### 2. Multi-Scope Policy Matching
Policies are matched in this order:
1. user
2. organization
3. plan
4. global fallback

### 3. Jitter + Backoff Strategy
When traffic exceeds the normal limit but stays below the burst threshold, requests are delayed using a calculated backoff plus random jitter. When traffic exceeds the burst threshold, requests are rejected with HTTP 429.

### 4. SLA Tuning Worker
A scheduled worker reviews usage logs and writes an adaptive limit back into Redis and MongoDB so bronze/silver tiers can be tightened under sustained overuse while low-utilization policies can be relaxed.

## Quick Start

### Local Development

#### Backend
```bash
cd server
npm install
npm run dev
```

#### Frontend
```bash
cd client
npm install
npm run dev
```

> Make sure MongoDB and Redis are running locally, or use Docker Compose.

### Docker Compose
```bash
cd docker
docker compose up --build
```

## Useful Endpoints

### Public/Test
- `GET /` - service overview
- `GET /api/status` - health check
- `ALL /api/test` - request-testing endpoint with middleware applied

### Admin
- `GET /admin/policies` - list policies
- `POST /admin/policies` - create or update a policy
- `GET /admin/analytics` - analytics dashboard data
- `POST /admin/policies/sync-sla` - run SLA tuner immediately

## Example Headers for Testing

```http
x-user-id: demo-user-1
x-org-id: acme-inc
x-plan: pro
```

## Trigger SLA Script

```bash
bash scripts/adjustLimits.sh http://localhost:5000
```

## Notes
- The root `.env` is shared by the server and Docker setup.
- The frontend uses `VITE_API_URL` to call the backend.
- The docker setup includes MongoDB, Redis, server, and client services.
