import React from "react";
import Link from "next/link";
import { Play, BookOpen, Headphones } from "lucide-react";
import { VerifiedStamp } from "./VerifiedStamp";
import { RateTag } from "./RateTag";

export interface CourseData {
  id: string | number;
  title: string;
  instructor: {
    name: string;
    verified: boolean;
    photoUrl?: string;
  };
  medium: "video" | "ebook" | "audio";
  category: "Tech" | "Business" | "Languages" | "Exams" | "Creative";
  durationOrPages: string; // e.g. "42 min" or "180 pages"
  ratePerMin: string; // e.g. "₦5 / min" or "$0.05 / min"
  unlockPrice: string; // e.g. "₦200 full unlock"
  coverImage: string;
  unlockedProgress?: number; // 0 to 100 percentage if already started
}

interface CourseCardProps {
  course: CourseData;
  className?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  Tech: "bg-[#3B5B7E] text-white",
  Business: "bg-[#8A5A14] text-white",
  Languages: "bg-[#7A4A6D] text-white",
  Exams: "bg-[#5F6B2D] text-white",
  Creative: "bg-[#A04A2E] text-white",
};

export function CourseCard({ course, className = "" }: CourseCardProps) {
  const getMediumIcon = () => {
    switch (course.medium) {
      case "video":
        return <Play className="w-3.5 h-3.5 fill-current" />;
      case "ebook":
        return <BookOpen className="w-3.5 h-3.5" />;
      case "audio":
        return <Headphones className="w-3.5 h-3.5" />;
    }
  };

  const tagStyle = CATEGORY_COLORS[course.category] || "bg-muted text-white";

  return (
    <article
      className={`ledger-card overflow-hidden flex flex-col justify-between group text-ink ${className}`}
    >
      <div>
        {/* Cover Image / Thumbnail with Category Badge */}
        <div className="relative aspect-[16/10] overflow-hidden bg-paper/50">
          <img
            src={course.coverImage}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
            loading="lazy"
          />
          <div className="absolute top-2.5 start-2.5 flex items-center gap-1.5">
            <span
              className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-wider ${tagStyle}`}
            >
              {course.category}
            </span>
            <span className="px-2 py-0.5 rounded-[4px] bg-black/85 text-white border border-white/20 text-[10px] font-semibold font-mono flex items-center gap-1 shadow-xs">
              {getMediumIcon()}
              <span>{course.durationOrPages}</span>
            </span>
          </div>

          {/* 2-Minute Free Preview Badge */}
          <div className="absolute bottom-2.5 end-2.5">
            <span className="px-2 py-0.5 rounded-[4px] bg-surface text-ink text-[11px] font-semibold border border-rule shadow-xs">
              2m free preview
            </span>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-4 space-y-2">
          {/* Instructor & Stamp */}
          <div className="flex items-center gap-2 text-xs text-muted">
            <span className="font-medium text-ink truncate">
              {course.instructor.name}
            </span>
            {course.instructor.verified && <VerifiedStamp />}
          </div>

          {/* Title */}
          <h3 className="font-serif font-bold text-base leading-snug line-clamp-2 text-ink group-hover:text-forest transition-colors">
            {course.title}
          </h3>

          {/* Unlock Progress Bar (if started) */}
          {course.unlockedProgress !== undefined && course.unlockedProgress > 0 && (
            <div className="pt-2 space-y-1">
              <div className="flex justify-between text-[11px] text-muted">
                <span>Unlock progress</span>
                <span className="font-mono tabular-nums font-semibold">
                  {course.unlockedProgress}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-rule rounded-full overflow-hidden">
                <div
                  className="h-full bg-sun rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, course.unlockedProgress)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pricing Tag & CTA */}
      <div className="p-4 pt-3 border-t border-rule flex items-center justify-between gap-3 bg-surface">
        <RateTag
          ratePerMin={course.ratePerMin}
          unlockPrice={course.unlockPrice}
          size="sm"
        />

        <Link
          href={`/dashboard/learner/course/${course.id}`}
          className="btn-forest text-xs py-2 px-3.5 min-h-[36px] shrink-0"
        >
          Preview free
        </Link>
      </div>
    </article>
  );
}

