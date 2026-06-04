import { Request, Response, NextFunction } from "express";
import { courseService } from "../services/course.service";
import {
  createCourseSchema,
  createLessonSchema,
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
}

export const courseController = new CourseController();
