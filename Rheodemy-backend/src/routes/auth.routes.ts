import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { authenticate } from "../middleware/authenticate";

const router = Router();

/**
 * Auth routes — public (no JWT required)
 *
 * POST /auth/register  → Create a new user account
 * POST /auth/login     → Authenticate and receive a JWT
 */
router.post("/register", (req, res, next) =>
  authController.register(req, res, next)
);

router.post("/login", (req, res, next) =>
  authController.login(req, res, next)
);
router.get("/me", authenticate, (req, res, next) =>
  authController.getMe(req, res, next)
);

export default router;
