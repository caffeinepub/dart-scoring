# Specification

## Summary
**Goal:** Add backend configuration plumbing and documentation for Google OAuth environment values with safe development defaults, without changing existing authentication behavior.

**Planned changes:**
- Add a single authoritative backend configuration structure containing: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, FRONTEND_OAUTH_REDIRECT.
- Ensure local development runs without secrets by providing sensible, non-empty defaults for all four values.
- Add a backend query method that returns a frontend-safe Google OAuth config shape (excluding GOOGLE_CLIENT_SECRET).
- Update upgrade/migration handling if stable state needs to store new Google OAuth configuration so upgrades remain safe.
- Update README/configuration docs to explain how to set/override the four values for dev and production, list the dev defaults, and explicitly note existing auth flows are unchanged.

**User-visible outcome:** Developers can configure Google OAuth via documented environment variables, and the frontend can fetch non-secret OAuth configuration values from the backend; existing authentication behavior remains unchanged.
