# Specification

## Summary
**Goal:** Make Internet Identity the only sign-in method and use the Internet Identity identity for authenticated backend calls (removing Google and Bearer-token flows).

**Planned changes:**
- Update `/login` to show only one primary button labeled exactly “Sign in”, remove/disable any Google sign-in UI and any Google-related copy, and keep all text in English.
- Ensure the “Sign in” action uses the official Internet Identity AuthClient login flow with `identityProvider: https://identity.ic0.app` (without editing immutable Internet Identity hook files).
- After successful Internet Identity login, call `GET https://dart-scoring-backend-vab.caffeine.xyz/auth/whoami`, store returned `principal` and `user` in centralized app session state, and show a clear English error if it fails.
- Refactor backend-call wiring so authenticated requests use an IC agent/actor configured with the AuthClient identity (no `Authorization: Bearer ...` for backend requests), while keeping guest flows working with clear English error handling.
- Update the header to show “Profile” plus principal and/or username when logged in, add “Sign out” that logs out via AuthClient and clears session state (and cached authenticated data); when logged out, show a “Sign in” action.
- Update Rooms UI so “Create with Account” is enabled/functional only when logged in via Internet Identity, and “Create without account” remains always available with an English explanation when account creation is unavailable.
- Remove/neutralize any remaining Google-OAuth-specific session handling or dev/testing UI so `/login` cannot crash or display Google configuration errors.

**User-visible outcome:** Users can sign in only via Internet Identity, see their profile info and sign out from the header, and create rooms with an account only when signed in; the app uses Internet Identity for authenticated backend calls and no longer shows or triggers Google login anywhere.
