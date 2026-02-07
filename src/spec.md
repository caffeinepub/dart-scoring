# Specification

## Summary
**Goal:** Harden the backend Google OAuth flow with secure, replay-resistant `state` handling, safer account-linking rules, and zero sensitive token logging.

**Planned changes:**
- Persist OAuth `state` server-side with a strict 10-minute TTL and enforce single-use validation in the Google OAuth callback (reject missing/expired/used states; invalidate state immediately after successful use).
- Add deterministic cleanup of expired/used `state` records during OAuth start/callback to prevent unbounded storage growth.
- Enforce Google linking rules: when `email_verified = false`, do not link to an existing user by email (avoid attaching Google OAuth identity fields to an existing account based on unverified email).
- Remove/avoid any backend logging that could include OAuth secrets (authorization codes, access/refresh/id tokens, app-issued tokens); log only non-sensitive error codes if needed.
- If stable state layout changes are required for persisted OAuth state, add a conditional migration to keep canister upgrades safe and deterministic.

**User-visible outcome:** Google sign-in continues to work, but with stronger protection against OAuth state replay, safer account linking when Google email is unverified, and no exposure of OAuth tokens in backend logs.
