# DesignDen — WBD End Review Evaluation Summary

> Last updated: 2026-04-17

---

## 1. Application Overview

DesignDen is a full-stack custom clothing platform with role-based access control:
- **Customer** → browse shop, create 3D custom designs, track orders, approve designer work
- **Designer** → accept orders, upload design files, update progress milestones
- **Manager** → assign designers, approve designs, manage production, assign delivery
- **Delivery** → pick up and deliver orders with OTP verification
- **Admin** → user management, payout processing, full system access

**Tech Stack:** React 19 + Vite (frontend) | Express + MongoDB + Mongoose (backend) | Redis (cache) | Bootstrap 5

---

## 2. DB Optimization

### Indexes Added (`server.cjs`)

| Collection | Index | Purpose |
|---|---|---|
| `users` | `{ email: 1 }` (unique) | Fast login lookup |
| `users` | `{ role: 1, approved: 1 }` | Role-based queries |
| `users` | `{ designerProfile.isAvailable, rating }` | Marketplace filter |
| `products` | `{ category, gender }` | Shop browsing |
| `products` | `{ featured: 1 }` | Home page featured |
| `products` | `{ name: text, description: text }` | Full-text search |
| `orders` | `{ userId, createdAt }` | Customer order history |
| `orders` | `{ status, createdAt }` | Dashboard status filter |
| `orders` | `{ designerId, status }` | Designer order list |
| `orders` | `{ deliveryPersonId, status }` | Delivery dashboard |
| `carts` | `{ userId }` (unique) | Cart lookup |
| `messages` | `{ orderId, createdAt }` | Chat thread query |
| `reviews` | `{ productId, createdAt }` | Product reviews |
| `notifications` | `{ userId, read, createdAt }` | Notification inbox |

### Query Planning
MongoDB uses these indexes automatically. Verify with:
```
db.orders.find({status:"pending"}).explain("executionStats")
```

---

## 3. Redis Caching

### Setup
- Library: `ioredis` (graceful fallback if Redis not running)
- Connection: configurable via `REDIS_HOST` / `REDIS_PORT` env vars

### Cached Routes

| Endpoint | TTL | Key Pattern |
|---|---|---|
| `GET /api/shop/products` | 120s | `products:{query_params}` |
| `GET /api/shop/featured` | 300s | `products:featured` |
| `GET /api/marketplace/designers` | 60s | `marketplace:designers:{params}` |

### Performance Benchmark
Run `GET /api/cache/benchmark` to see live comparison:
```json
{
  "benchmark": {
    "dbQueryMs": 45,
    "cacheHitMs": 1,
    "improvementPct": 97
  }
}
```
Cache hits are **~97% faster** than direct MongoDB queries for product listings.

### Cache Status
```
GET /api/health
→ { "redis": "connected", "mongodb": "connected", "uptime": 120 }
```

---

## 4. Web Services (REST API)

### B2C Endpoints (Customer-facing)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Customer login |
| GET | `/api/shop/products` | Browse products |
| POST | `/api/cart` | Add to cart |
| POST | `/api/customer/checkout` | Place order |
| GET | `/api/customer/orders` | Order history |
| PUT | `/api/customer/order/:id/approve-design` | Approve designer work |
| GET | `/api/marketplace/designers` | Browse designers |

### B2B Endpoints (Business/Admin-facing)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/manager/orders` | All orders for manager |
| PUT | `/api/manager/order/:id/assign-designer` | Assign designer |
| PUT | `/api/manager/order/:id/assign-delivery` | Assign delivery person |
| PUT | `/api/manager/order/:id/approve-design` | Approve designer submission |
| GET | `/api/designer/orders` | Designer order list |
| PUT | `/designer/api/order/:id/design-progress` | Update design progress |
| GET | `/api/admin/users` | User management |
| POST | `/api/admin/payout/:id/process` | Process designer payout |

### API Documentation
- **Swagger UI:** `http://localhost:5174/api-docs` (available in development)
- **OpenAPI spec:** `docs/swagger/openapi.annotations.cjs`
- Full documentation includes request/response schemas, auth requirements, and examples

---

## 5. Unit Testing

### Framework
**Jest** with 3 test suites covering core business logic.

### Test Results
```
Test Suites: 3 passed, 3 total
Tests:       84 passed, 84 total
Time:        ~0.7s
```

### Test Coverage

| Suite | File | Tests | Covers |
|---|---|---|---|
| Utils | `tests/unit/utils.test.cjs` | 28 | Price formatting, status labels, cache keys, price estimation |
| Auth | `tests/unit/auth.test.cjs` | 28 | Email/password validation, role checks, bcrypt hashing |
| Orders | `tests/unit/order.test.cjs` | 28 | Workflow state machine, cart totals, item validation |

### Running Tests
```bash
npm test                    # Run all tests
npm run test:coverage       # With coverage report
```

---

## 6. Containerization (Docker)

### Files
- `Dockerfile` — Multi-stage build (Node 20 Alpine)
- `docker-compose.yml` — Full stack: App + MongoDB + Redis
- `.dockerignore` — Excludes node_modules, .env, logs

### Build & Run
```bash
# Full stack with Docker Compose
docker-compose up --build

# App only (requires external MongoDB + Redis)
docker build -t designden .
docker run -p 5174:5174 \
  -e MONGODB_URI=mongodb://host:27017/designden \
  -e REDIS_HOST=host \
  designden
```

### Architecture
```
┌─────────────────────────────────────────┐
│           Docker Compose                │
│  ┌──────────┐  ┌───────┐  ┌─────────┐ │
│  │  App     │  │ Redis │  │ MongoDB │ │
│  │ :5174    │→ │ :6379 │  │ :27017  │ │
│  │ (Node 20)│  └───────┘  └─────────┘ │
│  └──────────┘                          │
└─────────────────────────────────────────┘
```

---

## 7. Continuous Integration (GitHub Actions)

### Pipeline: `.github/workflows/ci.yml`

| Job | Trigger | Steps |
|---|---|---|
| `test` | push/PR to master | Install → Jest with Redis service → Upload coverage artifact |
| `lint` | push/PR to master | Install → ESLint |
| `build` | after test+lint pass | Install → `vite build` → Upload dist artifact |
| `docker` | after build | `docker build` smoke test |

### CI Features
- Redis service spun up for integration-capable tests
- Coverage reports uploaded as artifacts (downloadable from GitHub Actions)
- Docker image built as final verification
- Fails fast: downstream jobs only run if upstream pass

---

## 8. Deployment

### Vercel (Frontend)
- Config: `vercel.json`
- Build: `npm run build` → `dist/`
- Framework: Vite (auto-detected)
- All routes rewrite to `index.html` (SPA routing)

### Render (Backend)
- Backend URL: `https://backend-gw9o.onrender.com`
- Set env vars: `MONGODB_URI`, `REDIS_HOST`, `SESSION_SECRET`, `EMAIL_USER`, `EMAIL_PASS`

### Environment Variables Required
```
MONGODB_URI=mongodb+srv://...
REDIS_HOST=redis-cloud-host
REDIS_PORT=6379
SESSION_SECRET=your-secret
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
API_BASE_URL=https://backend-gw9o.onrender.com
NODE_ENV=production
```

---

## 9. Quick Demo Checklist

- [ ] `GET /api/health` → shows MongoDB + Redis status
- [ ] `GET /api/cache/benchmark` → shows cache vs DB timing
- [ ] `GET /api/shop/products` (twice) → second call from cache
- [ ] `GET /api-docs` → Swagger UI with all endpoints
- [ ] `npm test` → 84 tests pass in terminal
- [ ] `docker-compose up` → all 3 services start
- [ ] GitHub Actions tab → CI pipeline run history
