import { Request, Response, NextFunction } from "express";
import { feedbackService } from "../services/feedback.service";
import { feedbackSchema } from "../types/course.types";
import { sendSuccess } from "../utils/response";
import { BadRequest } from "../utils/errors";

export class FeedbackController {
  async submitFeedback(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = feedbackSchema.safeParse(req.body);
      if (!parsed.success) {
        throw BadRequest(
          Object.values(parsed.error.flatten().fieldErrors).flat().join(", ")
        );
      }
      const userId = req.user?.userId || null;
      const feedback = await feedbackService.createFeedback(userId, parsed.data);
      sendSuccess(res, feedback, "Feedback submitted successfully", 201);
    } catch (err) {
      next(err);
    }
  }

  async getRecent(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const feedbacks = await feedbackService.getRecentFeedback(limit);
      sendSuccess(res, feedbacks, "Recent feedback retrieved");
    } catch (err) {
      next(err);
    }
  }
}

export const feedbackController = new FeedbackController();

