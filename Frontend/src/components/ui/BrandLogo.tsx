"use client";

import React from "react";
import Link from "next/link";

interface BrandLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showWordmark?: boolean;
  variant?: "editorial" | "grotesque" | "compound";
  color?: "default" | "forest" | "ink";
  href?: string;
  scrollToTop?: boolean;
}

export function BrandLogo({
  className = "",
  size = "md",
  showWordmark = true,
  variant = "editorial",
  color = "default",
  href = "/",
  scrollToTop = false,
}: BrandLogoProps) {
  // Dimensions for the icon mark
  const iconSizes = {
    sm: "w-6 h-6",
    md: "w-9 h-9",
    lg: "w-11 h-11",
    xl: "w-14 h-14",
  };

  const wordmarkSizes = {
    sm: "text-lg",
    md: "text-[1.65rem]",
    lg: "text-[2.1rem]",
    xl: "text-[2.6rem]",
  };

  const textColorClass = {
    default: "text-ink group-hover:text-forest",
    forest: "text-forest",
    ink: "text-ink",
  }[color];

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (typeof window !== "undefined") {
      if (scrollToTop || window.location.pathname === "/" || href === "#top" || href === "/") {
        if (window.location.pathname === "/") {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }
    }
  };

  return (
    <Link 
      href={href} 
      onClick={handleClick}
      className={`inline-flex items-center gap-2 group select-none cursor-pointer ${className}`}
      aria-label="Rheodemy Home"
    >
      {/* 🌊 The Rheodemy Flow Mark (Dynamically colored via CSS mask to always match Forest Green) */}
      <div
        className={`${iconSizes[size]} bg-forest transition-transform duration-300 group-hover:scale-105 shrink-0`}
        style={{
          maskImage: "url('/rheo-mark-forest.png')",
          maskSize: "contain",
          maskRepeat: "no-repeat",
          maskPosition: "center",
          WebkitMaskImage: "url('/rheo-mark-forest.png')",
          WebkitMaskSize: "contain",
          WebkitMaskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
        }}
        aria-hidden="true"
      />

      {/* ✍️ Wordmark Typography */}
      {showWordmark && (
        <span className="leading-none transition-colors">
          {variant === "editorial" && (
            <span className={`font-serif font-bold ${wordmarkSizes[size]} tracking-tight ${textColorClass} transition-colors`}>
              Rheodemy
            </span>
          )}

          {variant === "grotesque" && (
            <span className={`font-sans font-bold ${wordmarkSizes[size]} tracking-[-0.03em] ${textColorClass} transition-colors`}>
              Rheodemy
            </span>
          )}

          {variant === "compound" && (
            <span className={`${wordmarkSizes[size]} tracking-tight`}>
              <span className={`font-serif font-bold ${textColorClass}`}>Rheo</span>
              <span className="font-sans font-bold text-forest">demy</span>
            </span>
          )}
        </span>
      )}
    </Link>
  );
}

export default BrandLogo;

