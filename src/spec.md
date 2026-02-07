# Specification

## Summary
**Goal:** Fix same-origin `/api/*` routes so they no longer return Not Found after deployment by adding minimal Next.js API route handlers.

**Planned changes:**
- Add a `GET /api/health` handler that returns HTTP 200 with JSON body exactly `{ "ok": true }`.
- Add a `GET /api/auth/google/start` handler that returns an HTTP redirect (3xx) with a `Location` header pointing to a placeholder URL.
- Add a `GET /api/auth/google/callback` handler that returns HTTP 200 JSON including an English message containing the phrase "callback reached".
- Verify whether the project uses Next.js App Router (`/app`) or Pages Router (`/pages`) and place exactly one correct set of handlers accordingly so the deployed runtime resolves `/api/*` endpoints.

**User-visible outcome:** Navigating to `/api/health` returns `{ "ok": true }`, and the Google auth start/callback endpoints respond (redirect / JSON) instead of 404 Not Found when called from the existing frontend.
