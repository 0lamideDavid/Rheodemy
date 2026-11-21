import { prisma } from "../config/prisma";
import { FeedbackInput } from "../types/course.types";

/**
 * FeedbackService — community and learner feedback logic.
 */

export class FeedbackService {
  /**
   * Submit new feedback.
   */
  async createFeedback(userId: string | null, input: FeedbackInput) {
    return prisma.feedback.create({
      data: {
        userId,
        rating: input.rating,
        category: input.category || "monetization",
        comment: input.comment,
      },
    });
  }

  /**
   * Retrieve recent feedback items for ledger log.
   */
  async getRecentFeedback(limit: number = 10) {
    return prisma.feedback.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        user: { select: { firstName: true, lastName: true } },
      },
    });
  }
}

export const feedbackService = new FeedbackService();

