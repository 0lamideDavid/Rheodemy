"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function DashboardRedirect() {
  const router = useRouter();
  const { user, token, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!token || !user) {
      router.replace("/auth");
      return;
    }
    router.replace(
      user.role === "INSTRUCTOR" || user.role === "ADMIN"
        ? "/dashboard/creator"
        : "/dashboard/learner"
    );
  }, [isLoading, token, user, router]);

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center text-muted">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 rounded-full border-2 border-forest border-t-transparent animate-spin" />
        <span className="text-sm font-medium">Opening your dashboard…</span>
      </div>
    </div>
  );
}
