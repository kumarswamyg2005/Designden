# Swagger / OpenAPI Implementation for DesignDen

## What was added

### 1) Packages

The following Swagger packages were added to the root project:

- `swagger-ui-express`
- `swagger-jsdoc`

These are installed in `package.json` and lockfile.

### 2) Server integration

Swagger was integrated into `server.cjs` with **non-breaking additive routes**:

- `GET /api-docs` → Interactive Swagger UI
- `GET /openapi.json` → Raw OpenAPI 3.0 JSON spec

No existing business routes were changed, removed, or renamed.

---

### 3) OpenAPI source file

A dedicated annotations file was added:

- `docs/swagger/openapi.annotations.cjs`

This file contains documented API paths and references to shared schemas in `server.cjs` OpenAPI components.

---

## Which Swagger setup is used

This implementation uses:

1. **`swagger-jsdoc`** to build OpenAPI 3.0.3 spec from:
   - OpenAPI `definition` object in `server.cjs`
   - path annotations from `docs/swagger/openapi.annotations.cjs`

2. **`swagger-ui-express`** to serve the generated spec in browser UI.

---

## Current documented route groups

Initial useful route groups documented for this project:

- Security: `/api/csrf-token`
- Auth: login/signup/session/logout
- Shop: `/api/shop/products`
- Cart: `/api/customer/cart` (GET/POST)
- Checkout: `/customer/api/process-checkout`
- Orders: `/customer/api/orders`
- Tracking: `/api/order/{orderId}/track`
- Delivery: `/delivery/api/orders`

This is a production-safe starting structure that can be expanded incrementally to all endpoints.

---

## Environments and safety

Swagger is currently enabled only when:

- `NODE_ENV !== "production"`

So in production deployments, docs are not exposed by default.

If needed later, this can be switched to an explicit environment flag.

---

## How to use

1. Start server as usual (`npm run server` or `npm start`).
2. Open Swagger UI:
   - `http://localhost:5174/api-docs`
3. Raw spec:
   - `http://localhost:5174/openapi.json`

---

## Why this is useful for this project

Given your large multi-role API surface (customer, designer, manager, admin, delivery), Swagger now provides:

- one discoverable API catalog
- request/response contract visibility
- easier frontend/backend integration and testing
- a base structure to document all remaining endpoints without changing route behavior
  2
