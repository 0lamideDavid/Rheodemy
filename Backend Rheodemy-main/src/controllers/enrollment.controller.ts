import { Request, Response, NextFunction } from "express";
import { enrollmentService } from "../services/enrollment.service";
import { enrollSchema } from "../types/course.types";
import { sendSuccess } from "../utils/response";
import { BadRequest } from "../utils/errors";

/**
 * EnrollmentController — enrollment HTTP handlers.
 */

export class EnrollmentController {
  /**
   * POST /enrollments — Enroll current user in a course
   */
  async enroll(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = enrollSchema.safeParse(req.body);
      if (!parsed.success) {
        throw BadRequest(
          Object.values(parsed.error.flatten().fieldErrors).flat().join(", ")
        );
      }

      const enrollment = await enrollmentService.enroll(
        req.user!.userId,
        parsed.data.courseId
      );
      sendSuccess(res, enrollment, "Enrolled successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /enrollments/me — Get current user's enrollments
   */
  async getMyEnrollments(req: Request, res: Response, next: NextFunction) {
    try {
      const enrollments = await enrollmentService.getMyEnrollments(
        req.user!.userId
      );
      sendSuccess(res, enrollments, "Enrollments retrieved");
    } catch (error) {
      next(error);
    }
  }
}

export const enrollmentController = new EnrollmentController();
