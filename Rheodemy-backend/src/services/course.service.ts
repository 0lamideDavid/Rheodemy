import { prisma } from "../config/prisma";
import { NotFound, Forbidden } from "../utils/errors";
import { CreateCourseInput, CreateLessonInput } from "../types/course.types";

/**
 * CourseService — all course + lesson business logic.
 */

export class CourseService {
  /**
   * Create a new course.
   * Only callable by INSTRUCTOR users (enforced at the route level).
   */
  async createCourse(instructorId: string, input: CreateCourseInput) {
    const course = await prisma.course.create({
      data: {
        ...input,
        pricePerMinute: input.pricePerMinute,
        instructorId,
        status: "PUBLISHED", // Auto-publish for MVP
        lessons: {
          create: {
            title: "Introduction (Auto-generated)",
            contentUrl: "https://www.w3schools.com/html/mov_bbb.mp4", // Default to video for MVP demo
            durationSec: 120, // 2 mins
            order: 1,
          }
        }
      },
      include: {
        instructor: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    return course;
  }

  /**
   * Get all published courses.
   * Public endpoint — no auth required.
   */
  async getAllCourses() {
    return prisma.course.findMany({
      where: { status: "PUBLISHED" },
      include: {
        instructor: {
          select: { id: true, firstName: true, lastName: true },
        },
        _count: { select: { lessons: true, enrollments: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Get a single course by ID (with lessons).
   */
  async getCourseById(courseId: string) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        instructor: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        lessons: { orderBy: { order: "asc" } },
        _count: { select: { enrollments: true } },
      },
    });

    if (!course) {
      throw NotFound("Course not found");
    }

    return course;
  }

  /**
   * Get all lessons for a course, ordered by position.
   */
  async getLessons(courseId: string) {
    // Verify course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true },
    });

    if (!course) {
      throw NotFound("Course not found");
    }

    return prisma.lesson.findMany({
      where: { courseId },
      orderBy: { order: "asc" },
    });
  }

  /**
   * Add a lesson to a course.
   * Only the course's instructor can add lessons.
   */
  async addLesson(
    courseId: string,
    instructorId: string,
    input: CreateLessonInput
  ) {
    // Verify course exists and belongs to this instructor
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, instructorId: true },
    });

    if (!course) {
      throw NotFound("Course not found");
    }

    if (course.instructorId !== instructorId) {
      throw Forbidden("You can only add lessons to your own courses");
    }

    return prisma.lesson.create({
      data: {
        ...input,
        courseId,
      },
    });
  }

  /**
   * Get courses created by a specific instructor.
   */
  async getInstructorCourses(instructorId: string) {
    return prisma.course.findMany({
      where: { instructorId },
      include: {
        _count: { select: { lessons: true, enrollments: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }
}

export const courseService = new CourseService();
