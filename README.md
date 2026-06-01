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

### 🔲 Phase 1 — Database Schema Design - (Lauretta)

- [ ] Design and write the `User` model (id, name, email, passwordHash, walletAddress, role, createdAt)
- [ ] Design and write the `Course` model (id, title, description, instructorId, pricePerMinute, currency, createdAt)
- [ ] Design and write the `Lesson` model (id, courseId, title, duration, order, contentUrl)
- [ ] Design and write the `Enrollment` model (userId, courseId, enrolledAt, status)
- [ ] Design and write the `PaymentSession` model (id, userId, courseId, lessonId, startedAt, endedAt, totalPaid, status, killSwitchAt)
- [ ] Design and write the `Transaction` model (id, sessionId, amount, currency, ilpPacketRef, timestamp)
- [ ] Design and write the `Wallet` model (id, userId, walletAddress, provider, balance, currency)
- [ ] Define all Prisma relations (User→Wallet, User→Enrollments, Course→Lessons, Session→Transactions)
- [ ] Add proper indexes (email unique, walletAddress unique, foreign keys)
- [ ] Run `npx prisma migrate dev --name init` to generate and apply the first migration
- [ ] Run `npx prisma generate` to regenerate the Prisma Client
- [ ] Verify schema in Prisma Studio (`npx prisma studio`)

---

### 🔲 Phase 2 — Authentication System - (Lauretta)

- [ ] Create `src/utils/hash.ts` — bcrypt password hashing helpers (`hashPassword`, `comparePassword`)
- [ ] Create `src/utils/jwt.ts` — JWT sign and verify helpers (`signToken`, `verifyToken`)
- [ ] Create `src/utils/errors.ts` — custom `AppError` class with status codes
- [ ] Create `src/config/env.ts` — typed env loader using `dotenv` + `zod`
- [ ] Create `AuthService` — `register()`, `login()` logic against Prisma
- [ ] Create `AuthController` — `POST /auth/register`, `POST /auth/login` handlers
- [ ] Create `src/middleware/authenticate.ts` — JWT guard middleware for protected routes
- [ ] Create `src/routes/auth.routes.ts` — wire routes to controller
- [ ] Validate request payloads with Zod schemas (email, password length, etc.)
- [ ] Return standardized JSON responses `{ success, data, message }`
- [ ] Test register + login flow end-to-end (manual or Postman)

---

### 🔲 Phase 3 — Course & Session Management - (Lauretta)

- [ ] Create `CourseService` — `createCourse()`, `getAllCourses()`, `getCourseById()`, `getLessons()`
- [ ] Create `CourseController` — `GET /courses`, `GET /courses/:id`, `GET /courses/:id/lessons`
- [ ] Create `EnrollmentService` — `enroll()`, `getEnrollments()`, check for duplicate enrollments
- [ ] Create `EnrollmentController` — `POST /enrollments`, `GET /enrollments/me`
- [ ] Seed demo data — 2–3 sample courses, lessons, and one instructor user (for Demo Day)
- [ ] Create `src/prisma/seed.ts` and add `"seed"` script to `package.json`
- [ ] Add `instructor` role guard to course creation endpoint
- [ ] Write `src/routes/course.routes.ts` and mount on Express app
- [ ] Validate all request payloads with Zod
- [ ] Test all course and enrollment endpoints

---

### 🔲 Phase 4 — ILP Payment Streaming (Rafiki) - (Olamide)

- [ ] Create `src/config/rafiki.ts` — Rafiki client config (backend URL, auth URL, headers)
- [ ] Create `RafikiService` — wrapper for Rafiki Admin GraphQL API calls
  - [ ] `createIncomingPayment()` — create a payment pointer on Rafiki
  - [ ] `createOutgoingPayment()` — trigger wallet-to-wallet payment
  - [ ] `getPaymentStatus()` — poll or webhook for payment confirmation
- [ ] Create `PaymentSessionService`
  - [ ] `startSession()` — open a `PaymentSession` record, begin ILP stream
  - [ ] `tickPayment()` — chunky ticker: deduct per 2–5s interval, log `Transaction`
  - [ ] `endSession()` — close session, calculate total, update status
- [ ] Create `PaymentSessionController` — `POST /sessions/start`, `POST /sessions/:id/tick`, `POST /sessions/:id/end`
- [ ] Implement the **Chunky Ticker** — interval-based micropayment emitter (2–5s configurable)
- [ ] Implement **Direct Wallet Streaming** — no escrow, real-time transfer per tick
- [ ] Create `src/routes/session.routes.ts` and mount on app
- [ ] Handle ILP errors gracefully (network timeout, insufficient funds, Rafiki errors)
- [ ] Test a full payment stream cycle end-to-end

---

### 🔲 Phase 5 — Kill Switch & FX Controls - (Olamide)

- [ ] Create `KillSwitchService`
  - [ ] `activateKillSwitch(sessionId)` — immediately halt payment stream for a session
  - [ ] `getKillSwitchStatus(sessionId)` — return current halt state
- [ ] Create `KillSwitchController` — `POST /sessions/:id/kill`, `GET /sessions/:id/status`
- [ ] Create `src/config/fx.ts` — hardcoded FX table (`USD_TO_NGN`, `EUR_TO_NGN`, etc.) loaded from env
- [ ] Create `FxService` — `convert(amount, fromCurrency, toCurrency)` using the hardcoded table
- [ ] Integrate `FxService` into `PaymentSessionService.tickPayment()` for multi-currency support
- [ ] Add kill switch check inside the Chunky Ticker loop — stop ticking if killed
- [ ] Create admin endpoint `GET /admin/sessions` — list all active sessions (for demo oversight)
- [ ] Protect admin endpoints with a role guard (`role === 'ADMIN'`)
- [ ] Write `src/routes/admin.routes.ts`
- [ ] Test kill switch: start session → let it tick → kill → verify it stops

---

### 🔲 Phase 6 — Real-time Events, Demo Hardening & Testing - (Olamide)

- [ ] Set up Socket.io server alongside Express (`src/socket/index.ts`)
- [ ] Create `SocketService` — emit events to connected clients
  - [ ] `payment:tick` — emit on every chunky ticker interval with amount + timestamp
  - [ ] `session:ended` — emit when session ends or kill switch fires
  - [ ] `session:started` — emit when a new payment session begins
- [ ] Integrate `SocketService` into `PaymentSessionService` and `KillSwitchService`
- [ ] Create `src/utils/logger.ts` — structured console logger (timestamps, log levels)
- [ ] Add global Express error handler (`src/middleware/errorHandler.ts`)
- [ ] Add `src/middleware/requestLogger.ts` for HTTP request logging
- [ ] Create a centralized `src/app.ts` — assemble Express + Socket.io + all routes
- [ ] Create `src/index.ts` — server entrypoint (listen, DB connect, graceful shutdown)
- [ ] Write demo seed script with realistic data (courses, enrolled user, funded wallet)
- [ ] Full end-to-end demo walkthrough: register → enroll → start session → watch ticks → kill
- [ ] Confirm all Socket.io events fire correctly in the frontend (or Postman WebSocket client)
- [ ] Final code review — remove all `console.log` debugging, replace with logger
- [ ] Update all checklist items to `[x]` ✅

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
