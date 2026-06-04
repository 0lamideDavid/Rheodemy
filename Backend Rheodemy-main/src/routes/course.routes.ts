import { Router } from "express";
import { courseController } from "../controllers/course.controller";
import { authenticate, authorize } from "../middleware/authenticate";

const router = Router();

/**
 * Course and Lesson Routes
 * 
 * Public Routes:
 * GET /courses          - List all published courses
 * GET /courses/:id      - Get course details and lessons
 * GET /courses/:id/lessons - Get lessons list for a course
 * 
 * Authenticated Routes:
 * GET /courses/me/instructor - Get all courses created by the logged-in instructor
 * POST /courses              - Create a new course (INSTRUCTOR only)
 * POST /courses/:id/lessons  - Add a lesson to a course (INSTRUCTOR only, own course)
 */

router.get("/", (req, res, next) => courseController.getAllCourses(req, res, next));
router.get("/:id", (req, res, next) => courseController.getCourseById(req, res, next));
router.get("/:id/lessons", (req, res, next) => courseController.getLessons(req, res, next));

router.get("/me/instructor", authenticate, authorize("INSTRUCTOR"), (req, res, next) =>
  courseController.getMyInstructorCourses(req, res, next)
);

router.post("/", authenticate, authorize("INSTRUCTOR"), (req, res, next) =>
  courseController.createCourse(req, res, next)
);

router.post("/:id/lessons", authenticate, authorize("INSTRUCTOR"), (req, res, next) =>
  courseController.addLesson(req, res, next)
);

export default router;
