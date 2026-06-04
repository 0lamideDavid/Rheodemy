"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

export function Header() {
  const pathname = usePathname();
  const [homeUrl, setHomeUrl] = useState("/dashboard/learner");

  useEffect(() => {
    const role = localStorage.getItem('rheodemy_role');
    if (role === 'creator') {
      setHomeUrl('/dashboard/creator');
    } else {
      setHomeUrl('/dashboard/learner');
    }
  }, []);
  
  // Don't show top-left header on the very first screen, inside the dashboard, or creator signup
  if (pathname === "/" || pathname?.startsWith("/dashboard") || pathname === "/become-creator" || pathname === "/onboarding") return null;
  
  return (
    <header className="absolute top-0 left-0 w-full p-4 sm:p-6 flex items-center z-50 pointer-events-none">
      <Link href={homeUrl} className="pointer-events-auto">
        <img src="/logo.png" alt="Rheodemy" className="h-20 sm:h-24 w-auto object-contain drop-shadow-md hover:scale-105 transition-transform" />
      </Link>
    </header>
  );
}
