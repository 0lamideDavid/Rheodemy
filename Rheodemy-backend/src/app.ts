import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import courseRoutes from "./routes/course.routes";
import enrollmentRoutes from "./routes/enrollment.routes";
import sessionRoutes from "./routes/session.routes";
import adminRoutes from "./routes/admin.routes";
import walletRoutes from "./routes/wallet.routes";
import { errorHandler } from "./middleware/errorHandler";
import { requestLogger } from "./middleware/requestLogger";

/**
 * Express app factory.
 * Assembles middleware → routes → error handler.
 * Exported separately from the server so it can be tested without listening.
 */

const app = express();

// ── Global Middleware ────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// ── Health Check ─────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── API Routes ───────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/wallet", walletRoutes);

// ── Global Error Handler (must be LAST) ──────────────────────────────────────
app.use(errorHandler);

export default app;
