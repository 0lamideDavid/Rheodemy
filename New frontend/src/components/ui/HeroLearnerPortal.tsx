"use client";

import React from "react";

export default function HeroLearnerPortal() {
  return (
    <div className="relative w-full max-w-lg mx-auto flex items-center justify-center select-none py-6">
      
      {/* 🟢 Outer Container with Geometric Portal (Faithful to the reference image) */}
      <div className="relative w-[340px] sm:w-[420px] lg:w-[460px] h-[340px] sm:h-[420px] lg:h-[460px] flex items-center justify-center">
        
        {/* Subtle Ambient Circular Depth Ring */}
        <div className="absolute inset-0 rounded-full border border-forest/20 dark:border-forest/30 pointer-events-none" />

        {/* 🟡 Bold Geometric Accent Arc (Right-side crescent matching reference image) */}
        <div className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 w-24 sm:w-32 h-44 sm:h-56 pointer-events-none">
          <svg viewBox="0 0 100 180" className="w-full h-full text-sun" fill="currentColor">
            <path d="M 0,0 A 90,90 0 0,1 90,90 A 90,90 0 0,1 0,180 L 0,140 A 50,50 0 0,0 50,90 A 50,50 0 0,0 0,40 Z" />
          </svg>
        </div>

        {/* 🟡 Orbiting Yellow Dot (Smooth clockwise orbit around outer ring) */}
        <div className="absolute inset-0 rounded-full animate-orbit-cw pointer-events-none motion-reduce:animate-none">
          <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-sun shadow-xs" />
        </div>

        {/* 🔵 Orbiting Blue Dot (Smooth counter-clockwise orbit around outer ring) */}
        <div className="absolute inset-0 rounded-full animate-orbit-ccw pointer-events-none motion-reduce:animate-none">
          <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#2563EB] dark:bg-[#38BDF8] shadow-xs" />
        </div>

        {/* 👤 MAIN CIRCULAR PORTAL: Single Person Student Shot */}
        <div className="relative w-[280px] sm:w-[360px] lg:w-[400px] h-[280px] sm:h-[360px] lg:h-[400px] rounded-full overflow-hidden border-4 border-forest/20 dark:border-forest/40 bg-forest/10 dark:bg-forest/20 shadow-2xl">
          
          {/* Authentic Student Photography (Studio-isolated shot tailored for Rheodemy) */}
          <img
            src="/hero-student.jpg"
            alt="Young African university student smiling with books and backpack"
            className="w-full h-full object-cover object-center hover:scale-103 transition-transform duration-700"
          />

          {/* Soft inner shadow ring for high-end editorial finish */}
          <div className="absolute inset-0 rounded-full shadow-[inset_0_0_40px_rgba(15,91,69,0.25)] pointer-events-none" />
        </div>

      </div>

    </div>
  );
}
