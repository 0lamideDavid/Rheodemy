# Rheodemy — Antigravity Agent Steering File

You are working on **Rheodemy**, a real-time micropayment learning platform.
This file governs all agent behavior when modifying this codebase.

---

## 1. THE GOLDEN RULE

**Never rewrite what already exists. Always read the file first, then add or replace only what is missing or broken.**

If a page already has a layout, components, animations, or UI logic — keep them exactly as they are. Your job is to wire in backend connectivity, not redesign. If a component does not call the API yet, add the call. If a component uses mock/hardcoded data, replace only that data with real API data. Touch nothing else.

---

## 2. Project Overview

Rheodemy is a course marketplace where:
- **Learners** watch videos, read ebooks, listen to audio — and are billed in real-time via Interledger Protocol (ILP) micropayments as they consume content.
- **Creators** upload courses and receive streaming payment split: 80% creator / 15% platform / 5% bursary fund.
- Payments are streamed second-by-second via a **Master Faucet / Shared Pool** model using two static testnet wallets — no user-facing OAuth prompts.

---

## 3. Tech Stack

### Frontend (this repo)
- **Next.js 16.2.6** with App Router and React 19
- **TypeScript** — strict mode, no `any` unless absolutely necessary and always comment why
- **Tailwind CSS v4** — utility-first, no custom CSS files unless absolutely required
- **Framer Motion** — for animations; preserve all existing `motion.*` components
- **lucide-react** — for all icons; do not introduce a different icon library

### Backend (external — do not modify)
- **Node.js + TypeScript + Express.js** REST API
- **PostgreSQL** via **Prisma ORM**
- **Socket.io** for real-time payment event streaming
- **Interledger / Open Payments SDK** (`@interledger/open-payments`) for micropayments
- **ts-node-dev** for development hot-reload

---

## 4. Backend API & Socket Contracts

### Base URL
- Development: `http://localhost:4000`
- Store in `.env.local` as `NEXT_PUBLIC_API_URL=http://localhost:4000`
- Never hardcode the base URL in component files — always use `process.env.NEXT_PUBLIC_API_URL`

### Authentication
- The backend issues **JWT tokens** on login/register
- Store the JWT in **memory (React state or context)** — not localStorage, not cookies
- Attach to every authenticated request as: `Authorization: Bearer <token>`
- On 401 responses, clear the token and redirect to `/auth`

### REST Endpoints

#### Auth
```
POST /api/auth/register    — { name, email, password } → { token, user }
POST /api/auth/login       — { email, password }        → { token, user }
GET  /api/auth/me          — (auth required)             → { user }
```

#### Users
```
PATCH /api/users/role      — (auth required) { role: "LEARNER" | "CREATOR" } → { user }
```

#### Courses / Videos
```
GET  /api/videos           — → [{ id, title, description, muxPlaybackId, pricePerMinute, creator }]
GET  /api/videos/:id       — → { id, title, description, muxPlaybackId, pricePerMinute, creator }
POST /api/videos           — (auth, creator only) FormData with file + metadata → { video }
```

#### Payments / ILP
```
POST /api/payments/session/start  — (auth) { videoId } → { sessionId }
POST /api/payments/session/end    — (auth) { sessionId } → { totalCharged }
GET  /api/wallet/balance          — (auth) → { learnerBalance, creatorBalance }
GET  /api/wallet/transactions     — (auth) → [{ id, type, amount, description, createdAt }]
GET  /api/wallet/pointer          — (auth, creator only) → { pointerUrl }
```

### Socket.io Events

Install `socket.io-client` if not already present. Connect once in the course player when a session starts.

```
Connection URL: process.env.NEXT_PUBLIC_API_URL
Auth:           { token: "<jwt>" }

Events to LISTEN for:
  "session:started"    — { sessionId }
  "payment:tick"       — { sessionId, amountStreamed, creatorShare, platformShare, bursaryShare }
  "session:ended"      — { sessionId, totalCharged }

Events to EMIT:
  (none from frontend — backend drives the tick)
```

---

## 5. File-by-File Integration Map

When working on any file, follow this map exactly. Do not touch files not listed here unless a dependency forces it.

### `/src/context/LanguageContext.tsx`
- **Do not modify** — this is the i18n layer. It is complete.

### `/src/app/auth/page.tsx`
- Replace the `handleSubmit` stub with real API calls:
  - If `isLogin` → `POST /api/auth/login`
  - If `!isLogin` → `POST /api/auth/register`
- On success, store the returned `token` in a global `AuthContext` (create `/src/context/AuthContext.tsx` if it does not exist)
- On success, redirect to `/role` if new user, or `/dashboard/learner` or `/dashboard/creator` based on `user.role`
- Show inline error messages using the existing input styling — do not add a new toast library

### `/src/app/auth/verify/page.tsx`
- If this page handles OTP/email verification, wire it to `POST /api/auth/verify` — check backend for this endpoint first
- If the backend has no verify step, make this page auto-redirect to `/role` after a 2-second animated delay (keeping the existing UI)

### `/src/app/role/page.tsx`
- On role selection, call `PATCH /api/users/role` with the chosen role
- Store the role in `AuthContext`
- Redirect to the appropriate dashboard

### `/src/app/onboarding/page.tsx`
- On completion, update user profile via `PATCH /api/users/me` if that endpoint exists
- Otherwise redirect to dashboard — preserve all existing animations

### `/src/app/dashboard/learner/page.tsx`
- Replace any mock course arrays with data from `GET /api/videos`
- Show a loading skeleton using the existing card component style while fetching
- Handle empty state (no courses yet) with an existing-style empty message

### `/src/app/dashboard/creator/page.tsx`
- Replace mock earnings/stats with data from `GET /api/wallet/balance` and `GET /api/videos` (filtered by current user)
- Keep all existing charts and layout components intact

### `/src/app/dashboard/creator/upload/page.tsx`
- Wire the upload form to `POST /api/videos` using `FormData`
- Show upload progress using existing UI elements (progress bar if present, otherwise add a simple one matching the existing style)
- On success, redirect to `/dashboard/creator`

### `/src/app/dashboard/wallet/page.tsx`
- Replace the hardcoded `$45.00` learner balance with `GET /api/wallet/balance → learnerBalance`
- Replace the hardcoded `$1,240.50` creator balance with `creatorBalance`
- Replace the hardcoded `paymentPointer` with `GET /api/wallet/pointer → pointerUrl`
- Replace the mock transaction list with `GET /api/wallet/transactions`
- Preserve every existing Tailwind class, layout, and icon

### `/src/app/dashboard/learner/course/[id]/page.tsx`
- **This is the most critical file.**
- Replace `mockCourses` with `GET /api/videos/:id`
- On play start (`togglePlay` → `isPlaying = true`):
  - Call `POST /api/payments/session/start` with `{ videoId: id }`
  - Connect Socket.io and listen for `payment:tick`
  - Update `streamedSeconds`, `totalStreamed`, and the escrow breakdown panel in real-time from tick events
  - Do **not** change the tick-driven billing logic structure — just replace the simulated interval with real socket events
- On pause or unmount:
  - Call `POST /api/payments/session/end`
  - Disconnect socket
- The high-water mark logic (no charging for rewinding) is already in the UI — the backend enforces this too, so just pass `sessionId` correctly
- Preserve: all ebook pagination logic, idle detection, page cost capping, pre-release voting UI (voting can remain localStorage-based until a backend endpoint exists)

---

## 6. Auth Context (Create if Missing)

Create `/src/context/AuthContext.tsx` with:

```tsx
interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}
```

- Store token and user in React state only (not localStorage)
- Export a `useAuth()` hook
- Wrap the root layout (`/src/app/layout.tsx`) with `<AuthProvider>`
- `User` type should match Prisma schema: `{ id, email, name, role }`

---

## 7. New Dependencies to Install

Only install these if the feature requires them. Do not install speculatively.

```bash
npm install socket.io-client
npm install @mux/mux-player-react   # only if replacing the <video> tag with Mux player
```

---

## 8. Coding Standards

- All new files: TypeScript, no `any`, functional components with hooks
- Use `async/await` for all API calls, never `.then().catch()` chains
- Every fetch must handle loading state and error state — show errors inline, never silent failures
- Do not use `console.log` in production code — use `console.error` only for caught errors
- Do not install: axios, react-query, zustand, redux, or any state management library — use React context and `useState`
- Do not use `useEffect` for data that can be fetched in a Server Component — but note most pages are `"use client"` already
- Framer Motion animations already in the code: do not remove, do not add new ones unless the task explicitly requires animation

---

## 9. Environment Variables

Expected `.env.local` structure:
```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Never commit `.env.local`. Never hardcode secrets or URLs.

---

## 10. What NOT to Do

- Do not rename files or move them to different directories
- Do not refactor working UI components — only add what's missing
- Do not change CSS class names, Tailwind utility strings, or color values
- Do not add a new UI component library (shadcn, MUI, Radix, etc.)
- Do not change the Prisma schema in this repo — the backend owns the schema
- Do not create API routes inside Next.js (`/app/api/`) — the Express backend handles all API logic
- Do not add client-side routing changes — the existing `useRouter` calls define the navigation flow

---

## 11. Before You Write Any Code

1. Read the target file in full
2. Identify exactly what is hardcoded/mocked vs what is already wired
3. Confirm the backend endpoint exists (check the contracts in Section 4)
4. Write an implementation plan listing only the lines/functions you will change
5. Make the change — do not touch anything outside the scope of that plan
