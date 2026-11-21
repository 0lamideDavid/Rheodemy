import type { Course } from "@/lib/api";
import type { CourseData } from "@/components/ui/CourseCard";
import { formatUSD } from "@/lib/currency";

export const COURSE_CATEGORIES = [
  "All",
  "Tech",
  "Business",
  "Languages",
  "Exams",
  "Creative",
] as const;

const CATEGORY_KEYWORDS: Record<
  Exclude<(typeof COURSE_CATEGORIES)[number], "All">,
  string[]
> = {
  Tech: ["tech", "code", "program", "python", "typescript", "sql", "data", "ai", "machine", "web", "software", "mobile"],
  Business: ["business", "startup", "product", "finance", "marketing", "management", "money", "trade"],
  Languages: ["language", "french", "arabic", "english", "spanish", "portuguese", "kiswahili"],
  Exams: ["exam", "ican", "acca", "certification", "test", "prep"],
  Creative: ["design", "creative", "art", "writing", "photography", "ux", "music"],
};

export function courseCategory(course: Course): (typeof COURSE_CATEGORIES)[number] {
  const haystack = `${course.title} ${course.description}`.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((keyword) => haystack.includes(keyword))) {
      return category as (typeof COURSE_CATEGORIES)[number];
    }
  }
  return "Business";
}

export function courseMedium(course: Course): "video" | "audio" | "ebook" {
  const haystack = `${course.title} ${course.description}`.toLowerCase();
  if (haystack.includes("ebook") || haystack.includes("book") || haystack.includes("guide")) {
    return "ebook";
  }
  if (haystack.includes("audio") || haystack.includes("podcast")) {
    return "audio";
  }
  return "video";
}

export function toCourseCard(course: Course): CourseData {
  const lessons = course._count?.lessons ?? course.lessons?.length ?? 0;
  return {
    id: course.id,
    title: course.title,
    instructor: {
      name: `${course.instructor?.firstName ?? "Rheodemy"} ${
        course.instructor?.lastName ?? "Educator"
      }`.trim(),
      verified: true,
    },
    medium: courseMedium(course),
    category: courseCategory(course) === "All" ? "Business" : (courseCategory(course) as CourseData["category"]),
    durationOrPages: `${lessons} lesson${lessons === 1 ? "" : "s"}`,
    ratePerMin: `${formatUSD(course.pricePerMinute)} / min`,
    unlockPrice: "",
    coverImage:
      course.thumbnailUrl ||
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=1200&auto=format&fit=crop",
  };
}
