# Rheodemy New Frontend Migration

Goal: connect `New frontend/` to the existing Rheodemy API while keeping the currently deployed Vercel app untouched. Display all prices in USD. Add backend support for lifetime course caps/ownership and wallet top-ups. Keep Laurie and secure its API.

## Related documents

- [New frontend review plan](NEW_FRONTEND_REVIEW_PLAN.md) — phase-by-phase review protocol, pass conditions, static findings, and sign-off log.

## Status

- [x] Phase 0 — inspect repository, existing app/API contracts, and deployment boundary. Both old and new frontends and backend are present locally. `.git` is mounted read-only, so branch creation and remote pulls are unavailable in this workspace. No deployment changes made.
- [ ] Phase 1 — environment, API client, auth provider, route guards, USD formatting.
- [ ] Phase 2 — register/login and remove fake OTP flow.
- [ ] Phase 3 — real course catalog and course detail mapping.
- [ ] Phase 4 — payment session/player integration, Mux/audio/ebook, socket lifecycle, lifetime cap/ownership backend model and enforcement.
- [ ] Phase 5 — real wallet and creator dashboard; implement secure top-up flow using a supported payment provider, with idempotency and webhook confirmation.
- [ ] Phase 6 — secure Laurie endpoint, real catalog context, provider-specific model configuration.
- [ ] Phase 7 — landing/demo polish and accessibility/mobile review.
- [ ] Phase 8 — local build and end-to-end QA; document deployment steps without cutting over Vercel.

## Guardrails

- Never modify `Rheodemy-main/` or the live Vercel project.
- Reuse backend behavior from `Rheodemy-main/` as the reference; backend changes are limited to agreed ownership/cap and wallet top-up capabilities.
- Do not present demo balances, fake OTP, simulated payments, or simulated ownership as real.
- Top-ups must be confirmed server-side by a payment provider before wallet credit. Do not trust browser success callbacks.
- Keep provider/API secrets server-side. Laurie remains enabled but requires authentication and spend protections.
- Record progress and remaining blockers here at each phase boundary.

## Decisions

- Currency: USD.
- Lifetime cap / ownership: implement backend support; define cap behavior so lifetime total paid never exceeds the configured course cap, and ownership is recorded only after confirmed payment reaches that cap.
- Wallet top-up: implement provider-backed checkout and verified webhook credit. Provider credentials/account configuration may require manual setup; implement the integration seam and report precisely what is needed if credentials are absent.
- Laurie: keep it, secure endpoint and ground recommendations in live catalog.

## Acceptance

- Existing live deployment remains untouched.
- New frontend builds and runs locally with real API auth, data, session, wallet, and creator flows.
- Course amount display is USD and backend-enforced lifetime caps cannot be exceeded by parallel sessions.
- Top-up credits only after verified provider webhook and handles duplicate webhook delivery safely.
- Laurie rejects unauthenticated/oversized requests and uses real course data.
- Any provider credentials, database migration execution, or external setup needed for final runtime verification are listed explicitly.
