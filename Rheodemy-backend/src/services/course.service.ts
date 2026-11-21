import { prisma } from "../config/prisma";
import { NotFound, Forbidden } from "../utils/errors";
import { LedgerService } from "./ledger.service";
import { CreateCourseInput, CreateLessonInput, UpdateProgressInput } from "../types/course.types";

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
        lessons: {
          select: { contentType: true },
          orderBy: { order: "asc" },
          take: 1,
        },
        _count: { select: { lessons: true, enrollments: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Get all in-progress courses, continue course, unlocked and saved for a user.
   */
  async getUserInProgressCourses(userId: string) {
    const progressRecords = await prisma.courseProgress.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            instructor: { select: { id: true, firstName: true, lastName: true } },
            lessons: { orderBy: { order: "asc" } },
            _count: { select: { lessons: true } },
          },
        },
        lesson: { select: { id: true, title: true, order: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId },
      select: { courseId: true },
    });
    const savedCourseIds = new Set(bookmarks.map((b) => b.courseId));

    const courseIds = progressRecords.map((p) => p.courseId);
    const sessions = await prisma.paymentSession.findMany({
      where: {
        userId,
        courseId: { in: courseIds },
        status: { in: ["ENDED", "ACTIVE"] },
      },
      select: { courseId: true, totalPaid: true },
    });

    const amountPaidMap = new Map<string, number>();
    for (const session of sessions) {
      const current = amountPaidMap.get(session.courseId) || 0;
      amountPaidMap.set(session.courseId, current + Number(session.totalPaid));
    }

    const mapped = progressRecords.map((p) => {
      const totalPaid = amountPaidMap.get(p.courseId) || 0;
      const unlockPrice = Number(p.course.unlockPrice) || 10.0;
      const unlocked = totalPaid >= unlockPrice;
      const totalMinutes =
        p.course.lessons.reduce((acc, l) => acc + Math.round(l.durationSec / 60), 0) || 45;

      return {
        id: p.course.id,
        title: p.course.title,
        instructor: {
          name: `${p.course.instructor.firstName} ${p.course.instructor.lastName}`.trim(),
          verified: true,
          role: "Verified Educator",
        },
        medium: (p.course.lessons[0]?.contentType || "video").toLowerCase(),
        category: "Tech",
        tier: p.course.tier || "Core",
        totalMinutes,
        ratePerMin: `$${Number(p.course.pricePerMinute).toFixed(2)}/min`,
        rateNumeric: Number(p.course.pricePerMinute),
        unlockPrice: `$${unlockPrice} cap`,
        unlockCapNumeric: unlockPrice,
        coverImage:
          p.course.thumbnailUrl ||
          "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop",
        minutesLearned: p.minutesLearned,
        amountPaid: totalPaid,
        lastPosition:
          p.lastPosition ||
          (p.lesson ? `Lesson ${p.lesson.order}: ${p.lesson.title}` : "Lesson in progress"),
        unlocked,
        saved: savedCourseIds.has(p.courseId),
        completed: p.completed,
        completedDate: p.completedDate ? p.completedDate.toISOString() : undefined,
        description: p.course.description,
      };
    });

    const continueCourse = mapped.length > 0 ? mapped[0] : null;
    const inProgress = mapped.filter((c) => c.minutesLearned > 0 && !c.unlocked);
    const unlocked = mapped.filter((c) => c.unlocked);
    const saved = mapped.filter((c) => c.saved);
    const completed = mapped.filter((c) => c.completed);

    return {
      continueCourse,
      inProgress,
      unlocked,
      saved,
      completed,
      allProgress: mapped,
    };
  }

  /**
   * Update playback position and minutes learned for a course.
   */
  async updateCourseProgress(
    userId: string,
    courseId: string,
    input: UpdateProgressInput
  ) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true },
    });
    if (!course) {
      throw NotFound("Course not found");
    }

    const existing = await prisma.courseProgress.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    const completedDate = input.completed
      ? existing?.completedDate || new Date()
      : undefined;

    return prisma.courseProgress.upsert({
      where: { userId_courseId: { userId, courseId } },
      create: {
        userId,
        courseId,
        lastLessonId: input.lessonId,
        lastPosition: input.lastPosition,
        lastSeconds: input.lastSeconds || 0,
        minutesLearned: input.minutesLearned || 0,
        completed: input.completed || false,
        completedDate,
      },
      update: {
        lastLessonId: input.lessonId ?? existing?.lastLessonId,
        lastPosition: input.lastPosition ?? existing?.lastPosition,
        lastSeconds: input.lastSeconds ?? existing?.lastSeconds,
        minutesLearned: input.minutesLearned ?? existing?.minutesLearned,
        completed: input.completed ?? existing?.completed,
        completedDate,
      },
    });
  }

  /**
   * Toggle saving/bookmarking a course.
   */
  async toggleBookmark(userId: string, courseId: string) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true },
    });
    if (!course) {
      throw NotFound("Course not found");
    }

    const existing = await prisma.bookmark.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    if (existing) {
      await prisma.bookmark.delete({
        where: { id: existing.id },
      });
      return { saved: false };
    } else {
      await prisma.bookmark.create({
        data: { userId, courseId },
      });
      return { saved: true };
    }
  }

  /**
   * Get all bookmarked courses for user.
   */
  async getUserBookmarks(userId: string) {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            instructor: { select: { id: true, firstName: true, lastName: true } },
            _count: { select: { lessons: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return bookmarks.map((b) => b.course);
  }

  /**
   * Get aggregated performance stats for an instructor.
   */
  async getInstructorStats(instructorId: string) {
    const courses = await prisma.course.findMany({
      where: { instructorId },
      select: { id: true },
    });
    const courseIds = courses.map((c) => c.id);

    if (courseIds.length === 0) {
      return {
        totalRevenue: 0,
        activeLearners: 0,
        totalMinutesStreamed: 0,
        totalCourses: 0,
      };
    }

    const sessions = await prisma.paymentSession.findMany({
      where: {
        courseId: { in: courseIds },
        status: "ENDED",
      },
      select: {
        userId: true,
        totalPaid: true,
        startedAt: true,
        endedAt: true,
      },
    });

    const enrollments = await prisma.enrollment.findMany({
      where: { courseId: { in: courseIds } },
      select: { userId: true },
    });

    const uniqueLearners = new Set<string>([
      ...sessions.map((s) => s.userId),
      ...enrollments.map((e) => e.userId),
    ]);

    const totalPaid = sessions.reduce((sum, s) => sum + Number(s.totalPaid), 0);
    const totalRevenue = totalPaid * LedgerService.creatorShare;

    const totalMinutesStreamed = sessions.reduce((sum, s) => {
      if (s.endedAt && s.startedAt) {
        const diffMs = s.endedAt.getTime() - s.startedAt.getTime();
        return sum + Math.round(diffMs / (1000 * 60));
      }
      return sum;
    }, 0);

    return {
      totalRevenue: Number(totalRevenue.toFixed(2)),
      activeLearners: uniqueLearners.size,
      totalMinutesStreamed,
      totalCourses: courses.length,
    };
  }
}

export const courseService = new CourseService();
