# Module 11 Backend and Operations Testing

## Applied migration

`20260821220000_module_11_production_indexes` adds indexes for account pagination, token cleanup, and completed-paid order aggregates.

```bash
npm run prisma:deploy --workspace=@campusbites/api
```

## Health checks

Start MySQL and the API, then test:

```http
GET /api/health
GET /api/health/ready
GET /api/health/database
```

- Liveness returns `200` while the API process is responsive.
- Readiness returns `200` only when MySQL responds, otherwise `503 SERVICE_NOT_READY` without database error details.

## Authentication cleanup

Automatic cleanup runs at API startup and every `TOKEN_CLEANUP_INTERVAL_MINUTES`. To run it once:

```bash
npm run cleanup:auth --workspace=@campusbites/api
```

It permanently deletes expired refresh/reset tokens plus revoked/used records older than `TOKEN_RETENTION_DAYS`. It does not delete user accounts or active sessions.

## Security checks

1. Change a user's password and confirm old access and refresh tokens are rejected by REST and Socket.IO.
2. Confirm student tokens receive `403` from seller/admin routes and seller tokens receive `403` from student/admin routes.
3. Confirm one user cannot load/cancel/subscribe to another user's order and one seller cannot mutate another seller's outlet, menu, or order.
4. Send JSON larger than `API_BODY_LIMIT` and confirm it is rejected.
5. Upload a non-image, wrong field, multiple files, signature-mismatched image, and image over 5 MB; confirm each is rejected.
6. In a production-config test environment, confirm startup fails with development JWT secrets or `COOKIE_SECURE=false`.
7. Confirm `/api/role-check/*` is absent when `NODE_ENV=production`.

## Graceful shutdown

Start the compiled API, maintain a normal request or socket connection, and send `SIGTERM`. Confirm the log contains `Graceful shutdown started` and `Graceful shutdown complete`, the process stops accepting traffic, and it exits within `SHUTDOWN_TIMEOUT_SECONDS`.

## Automated gate

```bash
npm run lint --workspace=@campusbites/api
npm run typecheck --workspace=@campusbites/api
npm test --workspace=@campusbites/api
npm run build --workspace=@campusbites/api
npm audit --omit=dev
```

Operational references:

- `docs/PRODUCTION_RUNBOOK.md`
- `docs/MODULE_11_BACKEND_SECURITY_AUDIT.md`
- `docs/API_REFERENCE.md`
