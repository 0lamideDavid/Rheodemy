import { Router } from "express";
import { enrollmentController } from "../controllers/enrollment.controller";
import { authenticate } from "../middleware/authenticate";

const router = Router();

/**
 * Enrollment Routes (All require authentication)
 * 
 * POST /enrollments    - Enroll current user in a course
 * GET /enrollments/me  - Get current user's enrollments
 */

router.post("/", authenticate, (req, res, next) => enrollmentController.enroll(req, res, next));
router.get("/me", authenticate, (req, res, next) => enrollmentController.getMyEnrollments(req, res, next));

export default router;
