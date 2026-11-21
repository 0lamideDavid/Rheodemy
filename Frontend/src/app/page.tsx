"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Search, ArrowRight, Sun, Moon, Check } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { api, type Course } from "@/lib/api";
import { COURSE_CATEGORIES, toCourseCard } from "@/lib/courseView";
import { CourseCard } from "@/components/ui/CourseCard";
import HeroLearnerPortal from "@/components/ui/HeroLearnerPortal";
import { BrandLogo } from "@/components/ui/BrandLogo";

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const { token, role } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    let cancelled = false;
    api.courses
      .list()
      .then((data) => {
        if (!cancelled) setCourses(data);
      })
      .catch((error: Error) => {
        if (!cancelled) setLoadError(error.message);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredCourses = courses
    .map(toCourseCard)
    .filter((course) => {
      const matchesCategory = selectedCategory === "All" || course.category === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !query ||
        course.title.toLowerCase().includes(query) ||
        course.instructor.name.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });

  const dashboardHref =
    role === "creator" || role === "admin" ? "/dashboard/creator" : "/dashboard/learner";

  return (
    <div id="top" className="min-h-screen bg-paper text-ink font-sans flex flex-col selection:bg-sun/30">
      <header className="sticky top-0 z-40 bg-paper/95 border-b border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <BrandLogo />
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted">
              <a href="#courses" className="hover:text-ink transition-colors">Courses</a>
              <a href="#how-it-works" className="hover:text-ink transition-colors">How it works</a>
              <a href="#teach" className="hover:text-ink transition-colors">Teach</a>
            </nav>
          </div>

          <div className="hidden lg:flex items-center flex-1 max-w-xs mx-4">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-muted absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search courses or skills..."
                className="w-full ps-9 pe-3 py-2 bg-surface border border-rule focus:border-muted rounded-lg text-xs text-ink placeholder:text-muted transition-colors focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              aria-label="Toggle light or dark theme"
              className="w-9 h-9 rounded-lg border border-rule bg-surface hover:border-muted text-ink flex items-center justify-center transition-colors cursor-pointer"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-sun" /> : <Moon className="w-4 h-4 text-muted" />}
            </button>

            {token ? (
              <Link href={dashboardHref} className="btn-forest text-xs py-2 px-4 min-h-[38px]">
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/auth?login=true"
                  className="text-xs font-semibold text-muted hover:text-ink transition-colors px-2 hidden xs:inline"
                >
                  Sign in
                </Link>
                <Link href="/role" className="btn-forest text-xs py-2 px-4 min-h-[38px]">
                  Start learning
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 w-full space-y-16">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center overflow-visible">
          <div className="lg:col-span-6 space-y-6">
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight leading-[1.08]">
              <span className="font-serif text-ink block">Learn without borders.</span>
              <span className="font-sans font-bold text-forest block">Pay only for the minutes you use.</span>
            </h1>

            <p className="text-base sm:text-lg text-muted leading-relaxed max-w-2xl font-normal">
              No monthly subscription traps. Stream verified video lessons, interactive e-books, and masterclasses — paying strictly while you are actively learning, with a clear per-minute rate in USD.
            </p>

            <div className="lg:hidden w-full pt-2">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-muted absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search courses, skills, or teachers..."
                  className="w-full ps-9 pe-3 py-3 bg-surface border border-rule focus:border-muted rounded-lg text-sm text-ink placeholder:text-muted transition-colors focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-rule text-xs">
              <div className="flex items-start gap-2.5">
                <div className="p-1 rounded-[4px] bg-forest/10 text-forest shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="text-ink font-semibold block">Clear rate per minute</strong>
                  <span className="text-muted">Every course shows its rate in USD before paid playback starts.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-1 rounded-[4px] bg-forest/10 text-forest shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="text-ink font-semibold block">Zero charge on pause</strong>
                  <span className="text-muted">Rewatching and pausing are free. Pausing always pauses payment.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-1 rounded-[4px] bg-forest/10 text-forest shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="text-ink font-semibold block">2-minute free preview</strong>
                  <span className="text-muted">Watch any lesson before spending, then decide if it is worth it.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden lg:block lg:col-span-6 relative">
            <HeroLearnerPortal />
          </div>
        </section>

        <section id="courses" className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-forest font-mono">
                Live catalog
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ink mt-1">
                Explore courses by skill
              </h2>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              {COURSE_CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 rounded-[6px] text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    selectedCategory === category
                      ? "bg-forest text-white"
                      : "bg-surface text-muted hover:text-ink border border-rule"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="ledger-card overflow-hidden animate-pulse">
                  <div className="aspect-[16/10] bg-rule/40" />
                  <div className="p-4 space-y-3">
                    <div className="h-3 w-2/3 bg-rule/40 rounded" />
                    <div className="h-4 w-full bg-rule/40 rounded" />
                    <div className="h-3 w-1/2 bg-rule/40 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : loadError ? (
            <div className="p-8 ledger-card bg-surface text-center space-y-2">
              <p className="text-sm font-semibold text-clay">Could not load the catalog.</p>
              <p className="text-xs text-muted">{loadError}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}

          {!isLoading && !loadError && filteredCourses.length === 0 && (
            <div className="p-12 text-center ledger-card bg-surface">
              <p className="text-sm text-muted">No courses match that search yet. Try another subject.</p>
            </div>
          )}
        </section>

        <section id="how-it-works" className="ledger-card p-8 sm:p-12 bg-surface space-y-10">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs uppercase tracking-wider text-forest font-bold">
              Fair learning economics
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ink">
              How pay-as-you-learn works
            </h2>
            <p className="text-muted text-sm sm:text-base">
              Traditional courses demand money upfront before you even know if the instructor is a good fit. Rheodemy aligns cost with the value you actually consume.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-full bg-forest text-white font-mono font-bold text-sm flex items-center justify-center">
                1
              </div>
              <h3 className="font-serif font-bold text-lg text-ink">Know the price upfront</h3>
              <p className="text-xs text-muted leading-relaxed">
                Every course displays a USD rate per minute. You always know the exact cost before paid playback begins.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-8 h-8 rounded-full bg-forest text-white font-mono font-bold text-sm flex items-center justify-center">
                2
              </div>
              <h3 className="font-serif font-bold text-lg text-ink">Pay only for active attention</h3>
              <p className="text-xs text-muted leading-relaxed">
                The meter pauses instantly when you pause, walk away, or buffer. Reviewing completed segments is free.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-8 h-8 rounded-full bg-forest text-white font-mono font-bold text-sm flex items-center justify-center">
                3
              </div>
              <h3 className="font-serif font-bold text-lg text-ink">Settled on Interledger</h3>
              <p className="text-xs text-muted leading-relaxed">
                Payments stream to the educator through Interledger. There is no 30-day payout hold and no hidden currency markup.
              </p>
            </div>
          </div>
        </section>

        <section className="ledger-card p-8 sm:p-12 bg-surface space-y-6">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs uppercase tracking-wider text-forest font-bold">
              Ledger transparency
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ink">
              Where every micro-payment goes
            </h2>
            <p className="text-muted text-sm leading-relaxed">
              Every session is a real USD payment recorded in your wallet history and settled to the educator&apos;s Interledger wallet.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="h-4 w-full bg-rule rounded-sm overflow-hidden flex">
              <div className="h-full bg-forest" style={{ width: "90%" }} title="90% to educator" />
              <div className="h-full bg-[#3B5B7E]" style={{ width: "10%" }} title="10% platform infrastructure" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
              <div>
                <span className="font-mono font-bold text-sm text-forest block">90% Educator</span>
                <span className="text-muted text-[11px]">Streamed to the verified educator&apos;s wallet.</span>
              </div>
              <div>
                <span className="font-mono font-bold text-sm text-[#3B5B7E] block">10% Operations</span>
                <span className="text-muted text-[11px]">Low-bandwidth hosting, settlement, and verification.</span>
              </div>
            </div>
          </div>
        </section>

        <section id="teach" className="ledger-card p-8 sm:p-12 bg-paper border border-rule space-y-6">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs uppercase tracking-wider text-forest font-bold">
              For verified educators
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ink">
              Teach without middlemen. Get paid as students learn.
            </h2>
            <p className="text-muted text-sm leading-relaxed">
              Stop waiting 30 to 60 days for international wire payouts. Interledger streams your earnings into your wallet while students are actively learning.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
            <Link href="/become-creator" className="btn-forest text-sm py-3 px-6">
              Apply as a creator <ArrowRight className="w-4 h-4 ms-1" />
            </Link>
            <span className="text-xs text-muted">
              Create your account, publish a course, and start earning.
            </span>
          </div>
        </section>
      </main>

      <footer className="border-t border-rule bg-surface py-12 px-4 sm:px-6 mt-16 text-xs text-muted">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3">
            <BrandLogo size="lg" href="#top" scrollToTop={true} />
            <p className="max-w-xs text-xs text-muted leading-relaxed">
              Open Payments educational marketplace for emerging markets. Built on Interledger.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 font-medium text-ink">
            <a href="#how-it-works" className="hover:text-forest transition-colors">How it works</a>
            <a href="#courses" className="hover:text-forest transition-colors">Courses</a>
            <a href="#teach" className="hover:text-forest transition-colors">Teach</a>
            <Link href="/role" className="hover:text-forest transition-colors">Start</Link>
            <Link href="/auth?login=true" className="hover:text-forest transition-colors">Sign in</Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-rule flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px]">
          <span>© 2026 Rheodemy. All rights reserved.</span>
          <div className="flex gap-4">
            <span className="text-muted">English • Français • Português • Español • العربية • Kiswahili</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
