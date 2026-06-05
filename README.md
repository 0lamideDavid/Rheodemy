# Rheodemy 🚀

Rheodemy is a premium Web3 learning platform that pioneers **Pay-Per-Minute course monetization** using the **Interledger Protocol (ILP)** and Open Payments API. 

Instead of purchasing expensive up-front subscriptions or course bundles, students stream tiny fractions of a cent (in USD) in real time for every second of video watched, audio listened to, or text page read. Instructors receive real-time, micro-second payouts directly to their Web3 payment pointers.

---

## 🏗️ Project Architecture

The workspace consists of a decoupled frontend and backend repository:

*   **`Rheodemy-main` (Frontend):** Next.js 15 application utilizing standard React patterns, Tailwind CSS styling, robust client-side Auth and Localization contexts, role-based security guards, and premium multimedia players.
*   **`Rheodemy-backend` (Backend):** Node.js & Express REST API powered by TypeScript, Prisma ORM, PostgreSQL database, and WebSockets for real-time ILP streaming orchestration.

---

## ✨ Features Built

### 🎓 Learner Experience
*   **Interactive Player:** Custom media players supporting **Video**, **Audio**, and **eBook** lessons.
*   **Dynamic Lesson Accordion:** Dynamic, collapsible course sidebar that groups lessons by module. Only the module housing the currently playing lesson auto-expands on load, and learners can click to toggle modules manually.
*   **Unique Placeholders:** Every video lesson automatically renders a distinct, professional coding thumbnail (poster) before playback begins.
*   **Web3 Wallet Integration:** Seamless registration with automated Interledger wallet pointer generation.

### ✍️ Creator Experience
*   **Analytics Dashboard:** Clear insights into total students enrolled, total minutes streamed, and gross earnings.
*   **Course Creator Pipeline:** An intuitive uploading interface to add new courses, define price-per-minute structures, and establish modules.

### 🛡️ Core Infrastructure
*   **Decentralized Pay-As-You-Watch Ticks:** WebSockets send stream heartbeat verification ticks every second. As the heartbeat successfully checks out, ILP micro-payments transfer from the student's escrow directly to the instructor.
*   **Role-Based Security Guards:** Strictly enforces route access. Students attempting to access creator/instructor dashboards are immediately redirected to their respective homes with a premium custom error notice.
*   **Zero-Flicker Route Protection:** Resolves hydration flickering during auth check redirects using solid state conditions.
*   **Multi-language Support:** Live dynamic translations covering English, Spanish, French, German, and Chinese.

---

## 🔑 Default Accounts (Seeded)

For testing and review, the database is pre-seeded with the following three role profiles:

| Role | Email | Password | Purpose |
| :--- | :--- | :--- | :--- |
| **Instructor / Creator** | `instructor@rheodemy.com` | `password123` | Upload courses, customize pricing, track stats. |
| **Student / Learner** | `learner@rheodemy.com` | `password123` | Watch courses, stream payments, read ebooks. |
| **System Admin** | `admin@rheodemy.com` | `password123` | Full administrative access. |

---

## 🛠️ Getting Started

### Prerequisites
*   Node.js (v18+)
*   PostgreSQL Database
*   An active Interledger/Rafiki Open Payments sandbox environment

### 1. Backend Setup
1.  Navigate to the backend directory:
    ```bash
    cd Rheodemy-backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up your environment variables in `.env` (refer to `.env.example` in the root):
    ```env
    DATABASE_URL="postgresql://username:password@localhost:5432/rheodemy"
    JWT_SECRET="your_jwt_secret"
    OPEN_PAYMENTS_WALLET_ADDRESS="your_rafiki_payment_pointer"
    ```
4.  Run Prisma migrations & seed the database:
    ```bash
    npx prisma migrate dev --name init
    npx prisma db seed
    ```
5.  Start the development server:
    ```bash
    npm run dev
    ```

### 2. Frontend Setup
1.  Navigate to the frontend directory:
    ```bash
    cd Rheodemy-main
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure environment variables in `.env.local`:
    ```env
    NEXT_PUBLIC_API_URL="http://localhost:3001"
    ```
4.  Start the Next.js development server:
    ```bash
    npm run dev
    ```
5.  Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📄 License
This project is licensed under the MIT License.
