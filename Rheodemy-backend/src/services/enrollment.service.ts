import { prisma } from "../config/prisma";
import { NotFound, Conflict } from "../utils/errors";

/**
 * EnrollmentService — enrollment business logic.
 */

export class EnrollmentService {
  /**
   * Enroll a student in a course.
   * - Course must exist and be PUBLISHED
   * - Student cannot enroll twice in the same course
   */
  async enroll(userId: string, courseId: string) {
    // Verify course exists and is published
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true, status: true },
    });

    if (!course) {
      throw NotFound("Course not found");
    }

    if (course.status !== "PUBLISHED") {
      throw NotFound("Course is not available for enrollment");
    }

    // Check for duplicate enrollment (unique constraint will also catch this,
    // but we give a better error message)
    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    if (existing) {
      throw Conflict("You are already enrolled in this course");
    }

    const enrollment = await prisma.enrollment.create({
      data: { userId, courseId },
      include: {
        course: {
          select: { id: true, title: true, pricePerMinute: true, currency: true },
        },
      },
    });

    return enrollment;
  }

  /**
   * Get all enrollments for the current user.
   */
  async getMyEnrollments(userId: string) {
    return prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            instructor: {
              select: { id: true, firstName: true, lastName: true },
            },
            _count: { select: { lessons: true } },
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    });
  }

  /**
   * Check if a user is enrolled in a specific course.
   */
  async isEnrolled(userId: string, courseId: string): Promise<boolean> {
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
      select: { id: true },
    });

    return !!enrollment;
  }
}

export const enrollmentService = new EnrollmentService();
