"use client";

import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/ui/BrandLogo";

export function Header() {
  const pathname = usePathname();
  
  // Don't show top-left header on pages that render their own contextual navigation header
  if (
    pathname === "/" || 
    pathname?.startsWith("/dashboard") || 
    pathname === "/become-creator" || 
    pathname === "/onboarding" ||
    pathname === "/role" ||
    pathname?.startsWith("/auth")
  ) {
    return null;
  }
  
  return (
    <header className="absolute top-0 left-0 w-full p-4 sm:p-6 flex items-center z-50 pointer-events-none">
      <div className="pointer-events-auto">
        <BrandLogo size="lg" />
      </div>
    </header>
  );
}