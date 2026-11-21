"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/learner");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#08090C] flex items-center justify-center text-muted">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <span className="text-sm font-medium">Opening your dashboard...</span>
      </div>
    </div>
  );
}
