# New frontend review plan

Scope: `New frontend/` only. Never modify `Rheodemy-main/` or the live Vercel project.

Decision source: [RHEODEMY_NEW_FRONTEND_MIGRATION.md](RHEODEMY_NEW_FRONTEND_MIGRATION.md). Its decisions are fixed inputs to this review: USD display, backend-enforced lifetime caps/ownership, provider-verified wallet top-ups, and a secured Laurie grounded in real catalog data. This plan does not reopen them.

## Review protocol

For each phase in the migration doc:

1. Run the app locally from `New frontend/` (`npm run dev`), then check at 360px and 1280px, light and dark themes, and RTL.
2. For every data-driven section, verify loading (skeletons), empty, error, and success states — no blank screens.
3. Check one obvious primary action per screen, tabular figures for money/rates/counters, 44px+ touch targets, and that status is never colour-only.
4. Record `Pass`, `Fail`, or `Blocked` with evidence (screenshot, command output, or `file:line`). Blocked means an external dependency is missing; it is not a pass.
5. Never mark a simulation, demo balance, fake OTP, or hardcoded catalog as satisfying a real-data criterion. Label demo surfaces clearly if they remain.
6. At each phase boundary, update the migration doc's Status section and this plan's sign-off table.

## Phase review matrix

| Phase | Review focus | Pass condition | Current note |
| --- | --- | --- | --- |
| 1 — Environment, API client, auth provider, route guards, USD | Config, client, guards, formatting | Guards redirect before any protected screen paints; every price/rate/cap comes from one USD formatter | Not implemented: no API client, auth provider, or guards found; NGN strings remain throughout |
| 2 — Register/login, remove fake OTP | `auth/`, `auth/verify/`, onboarding | Real auth calls; no local OTP acceptance, no `alert()`, no `localStorage` identity | Local-only flow with `alert()` on resend and `localStorage` role/name |
| 3 — Course catalog and detail | Landing, course cards, player route | Courses, prices and caps come from the API; USD; real loading/error/empty states | Hardcoded course arrays with `₦` rates and caps |
| 4 — Payments, player, cap/ownership | Player session, media, socket lifecycle, backend cap | No spend while paused/buffered/hidden; backend-enforced cap; ownership after confirmed payment | Landing preview uses local timers and a hardcoded `₦200` cap; no media/socket integration |
| 5 — Wallet and creator dashboard, top-ups | `dashboard/wallet`, `dashboard/creator` | Real balance; provider checkout; credit only on verified webhook; duplicate webhook safe | Demo wallet balance and local feedback storage; no checkout/webhook seam |
| 6 — Laurie | `app/api/laurie/route.ts` | Authenticated, size-limited, real catalog, USD, keys server-side | Hardcoded NGN catalog in the prompt; no auth or body-size check |
| 7 — Landing polish, accessibility, mobile | All screens | Meets design spec: no gradients, glow, glass/blur, decorative particles; two type families; AA contrast | Glow/glass/blur and hardcoded colours on `coming-soon`; five font families loaded in root layout |
| 8 — Build and end-to-end QA | Whole project, deployment notes | `npm run lint` and `npm run build` pass; deployment documented with no Vercel cutover | Not yet run |

## Findings from the first static pass

1. **Secret hygiene (blocking).** `New frontend/env.local` contains provider API keys and is not ignored — `.gitignore` covers `.env*`, not `env.local`, and the file shows as untracked in `git status`. Rename it to `.env.local`, add an explicit ignore rule, and rotate the keys if they were ever committed.
2. **Currency (phase 1, blocking).** `₦`/NGN remains in `src/app/page.tsx`, `src/components/ui/HeroLedgerMockup.tsx`, `src/app/role/page.tsx`, `src/components/ui/WalletPill.tsx`, `src/app/onboarding/page.tsx`, and `src/app/api/laurie/route.ts`. Route all display through one USD formatter; the migration decision is USD.
3. **Demo data presented as real (phases 2–5).** The landing lesson preview and onboarding simulation stream local `setInterval` spend, and the wallet pill documents a `₦1,200.00` demo balance. Keep these only as explicitly labelled demos, or replace with API-backed flows.
4. **Auth is local-only (phase 2, blocking).** `src/app/auth/page.tsx` writes target/mode/name to `localStorage`; `src/app/auth/verify/page.tsx` accepts any six digits and uses `alert()` for resend. Replace with real API calls and inline status messaging.
5. **Laurie is unguarded and uses a fabricated catalog (phase 6, blocking).** `src/app/api/laurie/route.ts:6-13` embeds hardcoded course prices and caps; `POST` at line 15 reads the body with no authentication or size limit. Ground it in the real catalog, enforce auth and a body cap, and convert its price copy to USD.
6. **Design-spec drift (phase 7).** `src/app/coming-soon/page.tsx:14-26` uses `blur-[120px]`, `glass`, `shadow-[0_0_30px_rgba(0,212,200,0.2)]`, and raw `#0A0A0A`/teal; `src/app/layout.tsx:2-29` loads five font families against a two-family limit. Replace glow/glass/blur with token-based surfaces and reduce to serif + sans. `src/components/ParticleBackground.tsx` is already retired — keep it out of the tree.
7. **No route guards (phase 1, blocking).** `dashboard/` pages read role and name from `localStorage` in `src/app/dashboard/layout.tsx`; unauthenticated renders are possible. Add token validation and redirect before paint.

## Sign-off

| Phase | Result | Evidence | Blockers / external setup | Reviewed by | Date |
| --- | --- | --- | --- | --- | --- |
| 1 | Not reviewed | | | | |
| 2 | Not reviewed | | | | |
| 3 | Not reviewed | | | | |
| 4 | Not reviewed | | | | |
| 5 | Not reviewed | | | | |
| 6 | Not reviewed | | | | |
| 7 | Not reviewed | | | | |
| 8 | Not reviewed | | | | |
