import { Request, Response, NextFunction } from "express";
import { courseService } from "../services/course.service";
import {
  createCourseSchema,
  createLessonSchema,
  updateProgressSchema,
} from "../types/course.types";
import { sendSuccess } from "../utils/response";
import { BadRequest } from "../utils/errors";

/**
 * CourseController — thin HTTP layer for courses + lessons.
 */

export class CourseController {
  /**
   * POST /courses — Create a new course (INSTRUCTOR only)
   */
  async createCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = createCourseSchema.safeParse(req.body);
      if (!parsed.success) {
        throw BadRequest(
          Object.values(parsed.error.flatten().fieldErrors).flat().join(", ")
        );
      }

      const course = await courseService.createCourse(
        req.user!.userId,
        parsed.data
      );
      sendSuccess(res, course, "Course created", 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /courses — List all published courses (public)
   */
  async getAllCourses(_req: Request, res: Response, next: NextFunction) {
    try {
      const courses = await courseService.getAllCourses();
      sendSuccess(res, courses, "Courses retrieved");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /courses/:id — Get single course with lessons
   */
  async getCourseById(req: Request, res: Response, next: NextFunction) {
    try {
      const course = await courseService.getCourseById(req.params.id);
      sendSuccess(res, course, "Course retrieved");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /courses/:id/lessons — Get lessons for a course
   */
  async getLessons(req: Request, res: Response, next: NextFunction) {
    try {
      const lessons = await courseService.getLessons(req.params.id);
      sendSuccess(res, lessons, "Lessons retrieved");
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /courses/:id/lessons — Add a lesson (INSTRUCTOR only, own course)
   */
  async addLesson(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = createLessonSchema.safeParse(req.body);
      if (!parsed.success) {
        throw BadRequest(
          Object.values(parsed.error.flatten().fieldErrors).flat().join(", ")
        );
      }

      const lesson = await courseService.addLesson(
        req.params.id,
        req.user!.userId,
        parsed.data
      );
      sendSuccess(res, lesson, "Lesson added", 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /courses/me/instructor — Get courses by the current instructor
   */
  async getMyInstructorCourses(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const courses = await courseService.getInstructorCourses(
        req.user!.userId
      );
      sendSuccess(res, courses, "Your courses retrieved");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /courses/in-progress — Get in-progress, resume course, and saved list for learner
   */
  async getInProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await courseService.getUserInProgressCourses(req.user!.userId);
      sendSuccess(res, data, "In-progress courses retrieved");
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /courses/:id/progress — Update playback and minutes learned
   */
  async updateProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = updateProgressSchema.safeParse(req.body);
      if (!parsed.success) {
        throw BadRequest(
          Object.values(parsed.error.flatten().fieldErrors).flat().join(", ")
        );
      }
      const progress = await courseService.updateCourseProgress(
        req.user!.userId,
        req.params.id,
        parsed.data
      );
      sendSuccess(res, progress, "Progress updated");
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /courses/:id/save — Toggle save/bookmark
   */
  async toggleBookmark(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await courseService.toggleBookmark(
        req.user!.userId,
        req.params.id
      );
      sendSuccess(res, result, result.saved ? "Course bookmarked" : "Course removed from bookmarks");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /courses/saved — Get saved courses
   */
  async getBookmarks(req: Request, res: Response, next: NextFunction) {
    try {
      const bookmarks = await courseService.getUserBookmarks(req.user!.userId);
      sendSuccess(res, bookmarks, "Bookmarks retrieved");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /courses/instructor/stats — Aggregated creator analytics
   */
  async getInstructorStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await courseService.getInstructorStats(req.user!.userId);
      sendSuccess(res, stats, "Instructor stats retrieved");
    } catch (error) {
      next(error);
    }
  }
}

export const courseController = new CourseController();
