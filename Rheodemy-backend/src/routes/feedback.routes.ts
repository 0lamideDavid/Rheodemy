import { Router } from "express";
import { feedbackController } from "../controllers/feedback.controller";

const router = Router();

// Allow submitting feedback (optional auth handled in controller if token present)
router.post("/", (req, res, next) => feedbackController.submitFeedback(req, res, next));
router.get("/recent", (req, res, next) => feedbackController.getRecent(req, res, next));

export default router;

