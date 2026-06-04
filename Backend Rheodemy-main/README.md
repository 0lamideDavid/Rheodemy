# Rheodemy 🎓

> **"Learning without borders"**

Rheodemy is a real-time, pay-as-you-learn educational platform powered by the **Interledger Protocol (ILP)** using Rafiki. Students stream micropayments as they consume content — no upfront fees, no borders, no barriers.

---

## Tech Stack

| Layer         | Technology                          |
|---------------|-------------------------------------|
| Runtime       | Node.js (v20+)                      |
| Language      | TypeScript                          |
| Database      | PostgreSQL                          |
| ORM           | Prisma                              |
| Realtime      | Socket.io                           |
| Payments      | Rafiki (Interledger Protocol / ILP) |
| Auth          | JWT (JSON Web Tokens)               |
| Framework     | Express.js                          |

---

## Development Checklist

> ⚠️ **Rule:** You must update these checkboxes to `[x]` as each phase is completed. Do not skip phases or mark them complete prematurely.

---

### ✅ Phase 0 — Project Foundation

- [x] Initialize Node.js + TypeScript project
- [x] Create `package.json` with all dependencies (Express, Prisma, Socket.io, JWT, Zod, Rafiki)
- [x] Configure `tsconfig.json` (strict mode, path aliases, ES2020)
- [x] Scaffold folder structure (`src/controllers`, `services`, `routes`, `config`, `utils`, `modules`, `types`)
- [x] Create `.env.example` with all required env keys
- [x] Create `.gitignore` tailored for Node.js + Prisma
- [x] Initialize `prisma/schema.prisma` with PostgreSQL datasource
- [x] Write project `README.md` with tech stack and this checklist

---

### ✅ Phase 1 — Database Schema Design

- [x] Design and write the `User` model (id, firstName, lastName, email, passwordHash, role, status, createdAt)
- [x] Design and write the `Course` model (id, title, description, instructorId, pricePerMinute, currency, status, createdAt)
- [x] Design and write the `Lesson` model (id, courseId, title, durationSec, order, contentUrl)
- [x] Design and write the `Enrollment` model (userId, courseId, enrolledAt, status)
- [x] Design and write the `PaymentSession` model (id, userId, courseId, lessonId, startedAt, endedAt, totalPaid, status, killSwitchAt)
- [x] Design and write the `Transaction` model (id, sessionId, amount, platformFee, netAmount, currency, ilpPacketRef, tickIndex)
- [x] Design and write the `Wallet` model (id, userId, walletAddress, provider, currency)
- [x] Design and write the `Payout` model (id, transactionId, instructorWallet, amount, status, ilpPacketRef, failureReason)
- [x] Define all Prisma relations (User→Wallet, User→Enrollments, Course→Lessons, Session→Transactions, Transaction→Payout)
- [x] Add proper indexes (email unique, walletAddress unique, courseId+order unique, foreign keys)
- [x] Run `npx prisma migrate dev --name init` to generate and apply the first migration
- [x] Run `npx prisma generate` to regenerate the Prisma Client
- [x] Verified all 8 tables in PostgreSQL (`users`, `wallets`, `courses`, `lessons`, `enrollments`, `payment_sessions`, `transactions`, `payouts`)

---

### ✅ Phase 2 — Authentication System

- [x] Create `src/utils/hash.ts` — bcrypt password hashing helpers (`hashPassword`, `comparePassword`)
- [x] Create `src/utils/jwt.ts` — JWT sign and verify helpers (`signToken`, `verifyToken`)
- [x] Create `src/utils/errors.ts` — custom `AppError` class with status codes
- [x] Create `src/config/env.ts` — typed env loader using `dotenv` + `zod`
- [x] Create `AuthService` — `register()`, `login()` logic against Prisma
- [x] Create `AuthController` — `POST /auth/register`, `POST /auth/login` handlers
- [x] Create `src/middleware/authenticate.ts` — JWT guard + `authorize()` role factory
- [x] Create `src/routes/auth.routes.ts` — wire routes to controller
- [x] Validate request payloads with Zod schemas (email, password length, etc.)
- [x] Return standardized JSON responses `{ success, data, message }`
- [x] Test register + login flow end-to-end (all 6 test cases passing)

---

### ✅ Phase 3 — Course & Session Management

- [x] Create `CourseService` — `createCourse()`, `getAllCourses()`, `getCourseById()`, `getLessons()`
- [x] Create `CourseController` — `GET /courses`, `GET /courses/:id`, `GET /courses/:id/lessons`
- [x] Create `EnrollmentService` — `enroll()`, `getMyEnrollments()`, check for duplicate enrollments
- [x] Create `EnrollmentController` — `POST /enrollments`, `GET /enrollments/me`
- [x] Seed demo data — 2–3 sample courses, lessons, and one instructor user (for Demo Day)
- [x] Create `src/prisma/seed.ts` and add `"seed"` script to `package.json`
- [x] Add `instructor` role guard to course creation endpoint
- [x] Write `src/routes/course.routes.ts` & `src/routes/enrollment.routes.ts` and mount on Express app
- [x] Validate all request payloads with Zod
- [x] Test all course and enrollment endpoints (all integration test cases passing)

---

### ✅ Phase 4 — ILP Payment Streaming (Shared Pool / Master Faucet)

- [x] Generate Ed25519 key pairs (student + teacher) and register on `interledger-test.dev`
  - Student: `$ilp.interledger-test.dev/rheodemy` / Key ID: `rheodemy-student-key-1`
  - Teacher: `$ilp.interledger-test.dev/olamide` / Key ID: `rheodemy-teacher-key-1`
- [x] Rewrite `src/config/rafiki.ts` — **dual-client factory** (`getStudentClient` / `getTeacherClient`), each signing with their own Ed25519 PEM key, both cached as singletons
- [x] Rewrite `src/services/rafiki.service.ts` — **5-step Open Payments pipeline** per tick:
  - [x] Step 1: Teacher client resolves wallet address
  - [x] Step 2: Teacher client requests grant + creates `IncomingPayment` (invoice)
  - [x] Step 3: Student client resolves wallet address
  - [x] Step 4: Student client creates `Quote` (ILP handles FX automatically)
  - [x] Step 5: Student client requests grant + dispatches `OutgoingPayment`
  - [x] Uses `isPendingGrant()` guard — throws on interactive grant (not supported server-side)
- [x] Rewrite `src/services/paymentSession.service.ts` — **fail-safe Chunky Ticker**:
  - [x] `startSession()` — wallet check, creates DB record, starts `setInterval`
  - [x] `_executeTick()` — ILP fires FIRST; DB only updated on ILP success (fail-safe contract)
  - [x] `endSession()` — clears ticker, marks `ENDED`, returns summary
  - [x] `killSession()` / `_killSession()` — force-stops ticker, marks `KILLED`, logs reason
  - [x] Atomic `prisma.$transaction()` — `Transaction` + `Payout` + session `totalPaid` update in one write
- [x] Rewrite `src/controllers/paymentSession.controller.ts` — wallet addresses from env (not client input)
- [x] Rewrite `src/routes/session.routes.ts` — kill switch guarded by `INSTRUCTOR | ADMIN` role
- [x] Schema migration: `lessonId String?` (optional) + `lesson Lesson?` relation
- [x] Updated `.env` with dual `STUDENT_*` and `TEACHER_*` credential blocks
- [x] End-to-end session tests all passing (start → status → end → kill switch RBAC)

---

### ✅ Phase 5 — Kill Switch & FX Controls

- [x] **Kill Switch** — already integrated in Phase 4 `PaymentSessionService`:
  - [x] `killSession(sessionId)` — public method called by controller
  - [x] `_killSession(sessionId, reason)` — internal, also auto-fires on ILP failure
  - [x] `POST /sessions/:id/kill` — guarded by `INSTRUCTOR | ADMIN` role
- [x] Create `src/config/fx.ts` — FX rate table (`USD_TO_NGN`, `EUR_TO_GBP`, etc.) loaded from env at startup; 6 currencies supported (USD/NGN/EUR/GBP/KES/GHS)
- [x] Create `FxService` (`src/services/fx.service.ts`)
  - [x] `convert(amount, from, to)` — pivots via USD, returns `ConversionResult` with rate
  - [x] `getRates()` — returns full rate table for UI
  - [x] `getSupportedCurrencies()` — for validation
- [x] Integrate `FxService` into `PaymentSessionService._executeTick()` — every tick result now includes `localAmount`, `localCurrency`, `fxRate`, `totalPaidLocal`
- [x] Create `AdminController` (`src/controllers/admin.controller.ts`)
  - [x] `GET /admin/sessions` — live active session list (from in-memory ticker Map + DB join)
  - [x] `GET /admin/sessions/history` — paginated history with full transaction log, filter by status
  - [x] `GET /admin/fx/rates` — current FX rate table
  - [x] `GET /admin/fx/convert?amount=&from=&to=` — on-demand conversion
- [x] Create `src/routes/admin.routes.ts` — all routes behind `authenticate + authorize('ADMIN')`
- [x] Mount `/api/admin` in `src/app.ts`
- [x] Added `DISPLAY_CURRENCY`, `FX_USD_TO_*` vars to `.env`
- [x] TypeScript compiles clean (0 errors)

---

### ✅ Phase 6 — Real-time Events, Demo Hardening & Logging

- [x] Set up Socket.io server alongside Express (`src/socket/index.ts`)
  - [x] Attached to shared HTTP server — Express + Socket.io on the same port
  - [x] JWT auth middleware — connections rejected without valid token
  - [x] `join:session` event — clients subscribe to a session room by `sessionId`
- [x] Create `SocketService` (`src/socket/index.ts`) — singleton emitter:
  - [x] `emitTick(sessionId, tickResult)` — full TickResult (USD + NGN + ILP ref) on every tick
  - [x] `emitSessionStarted(sessionId, userId, courseId)` — session start notification
  - [x] `emitSessionEnded(sessionId, summary)` — clean end with full summary
  - [x] `emitSessionKilled(sessionId, reason)` — kill reason forwarded to client
- [x] Integrated `SocketService` into `PaymentSessionService` (all Phase 6 hook comments replaced)
- [x] Create `src/utils/logger.ts` — structured logger with ISO timestamps + log levels (info/warn/error/debug)
- [x] Create `src/middleware/requestLogger.ts` — HTTP request/response logging with timing; redacts sensitive fields; skips `/health`
- [x] Mounted `requestLogger` in `src/app.ts`
- [x] Updated `src/index.ts` — creates HTTP server first, attaches Socket.io, uses structured logger
- [x] Graceful shutdown handlers (`SIGINT`/`SIGTERM`) — disconnects Prisma cleanly
- [x] TypeScript compiles clean (0 errors)

**Socket.io connection (client-side):**
```js
const socket = io('http://localhost:4000', { auth: { token: '<JWT>' } });
socket.emit('join:session', '<sessionId>');
socket.on('payment:tick', (data) => console.log(data));
socket.on('session:killed', (data) => console.log(data));
```

---

## Project Structure

```
src/
├── config/          # Environment config, constants, FX rates
├── controllers/     # Request handlers (thin layer — delegate to services)
├── routes/          # Express route definitions
├── services/        # Core business logic
├── modules/         # Feature-based groupings (auth, courses, payments)
├── utils/           # Shared helpers (errors, logger, validators)
├── types/           # TypeScript interfaces and custom types
prisma/
├── schema.prisma    # Prisma data model
├── migrations/      # Auto-generated migration files
```

---

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Fill in your values
```

### 3. Run Database Migrations

```bash
npx prisma migrate dev --name init
```

### 4. Start Dev Server

```bash
npm run dev
```

---

## Scripts

| Script          | Command           | Description                    |
|-----------------|-------------------|--------------------------------|
| `npm run dev`   | `ts-node-dev`     | Hot-reload development server  |
| `npm run build` | `tsc`             | Compile TypeScript to JS       |
| `npm start`     | `node dist/`      | Run compiled production build  |

---

## Environment Variables

See [`.env.example`](./.env.example) for all required variables.

---

## License

MIT © Rheodemy Team
