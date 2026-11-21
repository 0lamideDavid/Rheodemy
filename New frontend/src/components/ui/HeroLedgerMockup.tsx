"use client";

import React from "react";
import { Search, Calendar, Play, Video, Volume2, MoreHorizontal, CheckCircle2 } from "lucide-react";
import { VerifiedStamp } from "./VerifiedStamp";

export default function HeroLedgerMockup() {
  return (
    <div className="relative w-full h-[520px] sm:h-[560px] lg:h-[600px] flex items-center justify-center overflow-visible select-none pointer-events-none sm:pointer-events-auto">
      
      {/* 📐 Isometric Tilting Canvas (Styled after filllo) */}
      <div 
        className="relative w-[520px] sm:w-[580px] xl:w-[620px] transition-transform duration-500 ease-out origin-center"
        style={{
          transform: "rotate(-14deg) skewX(-4deg)",
        }}
      >
        
        {/* 📄 BASE TILTED BOARD: Application Calendar & Learning Roadmap */}
        <div className="bg-surface rounded-[28px] border border-rule p-6 shadow-[0_25px_60px_-15px_rgba(20,33,28,0.18)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)]">
          
          {/* Dashboard Header Bar */}
          <div className="flex items-center justify-between gap-4 pb-5 border-b border-rule">
            
            {/* Logo Mark inside app */}
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Rheodemy" className="h-6 w-auto" />
            </div>

            {/* Search Pill inside app */}
            <div className="hidden sm:flex items-center gap-2 bg-paper px-3 py-1.5 rounded-full border border-rule text-xs text-muted">
              <Search className="w-3.5 h-3.5 text-muted" />
              <span>Search lessons, streams...</span>
            </div>

            {/* Right Controls: Month Selector & Avatars */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-muted bg-paper px-2.5 py-1 rounded-lg border border-rule font-medium">
                <Calendar className="w-3.5 h-3.5 text-muted" />
                <span>Nov 2026</span>
              </div>

              {/* Onboard Avatars */}
              <div className="flex items-center -space-x-1.5">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=80&auto=format&fit=crop" 
                  alt="Student"
                  className="w-6 h-6 rounded-full border-2 border-surface object-cover" 
                />
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=80&auto=format&fit=crop" 
                  alt="Student" 
                  className="w-6 h-6 rounded-full border-2 border-surface object-cover" 
                />
                <img 
                  src="https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=80&auto=format&fit=crop" 
                  alt="Student" 
                  className="w-6 h-6 rounded-full border-2 border-surface object-cover" 
                />
                <div className="w-6 h-6 rounded-full border-2 border-surface bg-paper flex items-center justify-center text-[10px] font-bold text-muted">
                  +8
                </div>
              </div>
            </div>

          </div>

          {/* Board Title & Current Time Marker */}
          <div className="flex items-center justify-between pt-4 pb-3">
            <h4 className="font-serif text-xl sm:text-2xl font-bold text-ink tracking-tight">
              Learning Roadmap
            </h4>
            <div className="flex items-center gap-2 text-xs font-mono text-muted">
              <span className="w-2 h-2 rounded-full bg-forest animate-pulse" />
              <span>Live ILP Stream</span>
            </div>
          </div>

          {/* Days of Week Timeline Header */}
          <div className="grid grid-cols-6 gap-2 text-center text-xs py-2 border-b border-rule font-medium text-muted">
            <div>
              <span className="block text-[10px] uppercase text-muted/70">Mon</span>
              <span className="text-ink font-bold">08</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase text-muted/70">Tue</span>
              <span className="text-ink font-bold">09</span>
            </div>
            <div className="bg-forest/10 rounded-lg py-0.5 text-forest">
              <span className="block text-[10px] uppercase font-bold">Wed</span>
              <span className="font-extrabold">10</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase text-muted/70">Thu</span>
              <span className="text-ink font-bold">11</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase text-muted/70">Fri</span>
              <span className="text-ink font-bold">12</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase text-muted/70">Sat</span>
              <span className="text-ink font-bold">13</span>
            </div>
          </div>

          {/* Calendar Track Body with Timeline Pills (just like filllo) */}
          <div className="relative py-4 space-y-3 min-h-[170px]">
            
            {/* Timeline vertical guide rules */}
            <div className="absolute inset-0 grid grid-cols-6 gap-2 pointer-events-none opacity-20">
              <div className="border-r border-rule h-full" />
              <div className="border-r border-rule h-full" />
              <div className="border-r border-forest h-full" />
              <div className="border-r border-rule h-full" />
              <div className="border-r border-rule h-full" />
            </div>

            {/* Active Pill 1: Systems Architecture (Forest Green Pill like 'Development' in filllo) */}
            <div className="relative z-10 ml-12 sm:ml-20 mr-4 bg-forest text-paper px-3.5 py-2 rounded-full shadow-md flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=80&auto=format&fit=crop" 
                  alt="Alex Chen"
                  className="w-5 h-5 rounded-full border border-paper/30 object-cover" 
                />
                <span className="text-xs font-bold tracking-tight">Distributed Systems</span>
              </div>
              <div className="flex items-center gap-2">
                <Volume2 className="w-3.5 h-3.5 text-paper/80" />
                <span className="text-[11px] font-mono bg-paper/20 px-2 py-0.5 rounded-full text-paper font-semibold">
                  ₦5 / min
                </span>
              </div>
            </div>

            {/* Inactive Pill 2: Web designing (White pill like in filllo) */}
            <div className="relative z-10 ml-4 sm:ml-8 mr-24 bg-surface border border-rule px-3.5 py-1.5 rounded-full shadow-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-tech" />
                <span className="text-xs font-semibold text-ink">Interledger Settlement</span>
              </div>
              <span className="text-[11px] font-mono text-muted">2-min preview</span>
            </div>

            {/* Inactive Pill 3: Human-Centered Design */}
            <div className="relative z-10 ml-28 sm:ml-36 mr-8 bg-surface border border-rule px-3.5 py-1.5 rounded-full shadow-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sun" />
                <span className="text-xs font-semibold text-ink">Product-Market Fit Africa</span>
              </div>
              <span className="text-[11px] font-mono text-muted">₦4 / min</span>
            </div>

          </div>

        </div>

        {/* 🗂️ OVERLAID FLOATING CARD: Foreground Course Progress (Exactly like filllo) */}
        <div 
          className="absolute -bottom-10 -left-6 sm:-left-10 z-30 w-[280px] sm:w-[310px] bg-surface rounded-2xl border border-rule p-4 sm:p-5 shadow-[0_20px_45px_-10px_rgba(20,33,28,0.22)] dark:shadow-[0_20px_45px_-10px_rgba(0,0,0,0.8)]"
        >
          
          {/* Card Top: Icon & More Options */}
          <div className="flex items-center justify-between mb-2.5">
            <div className="w-8 h-8 rounded-lg bg-forest/10 text-forest flex items-center justify-center">
              <Video className="w-4 h-4" />
            </div>
            <MoreHorizontal className="w-4 h-4 text-muted cursor-pointer" />
          </div>

          {/* Title & Progress Circle Row */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h5 className="font-serif text-base font-bold text-ink leading-snug">
                UI/UX & Systems Architecture
              </h5>
              <p className="text-[11px] text-muted mt-0.5">Beginner to Advanced</p>
            </div>

            {/* Circular Progress Ring (SVG) */}
            <div className="shrink-0 flex flex-col items-center">
              <div className="relative w-11 h-11 flex items-center justify-center">
                <svg className="w-11 h-11 -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-paper stroke-current"
                    strokeWidth="3.5"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-forest stroke-current"
                    strokeWidth="3.5"
                    strokeDasharray="85, 100"
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute text-[10px] font-mono font-bold text-ink">85%</span>
              </div>
              <span className="text-[9px] uppercase font-bold text-muted mt-0.5">Unlocked</span>
            </div>
          </div>

          {/* Learners Avatars & Module Count */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-rule">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-muted">Learners:</span>
              <div className="flex items-center -space-x-1">
                <img 
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=60&auto=format&fit=crop" 
                  alt="Learner" 
                  className="w-5 h-5 rounded-full border border-surface object-cover" 
                />
                <img 
                  src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=60&auto=format&fit=crop" 
                  alt="Learner" 
                  className="w-5 h-5 rounded-full border border-surface object-cover" 
                />
                <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=60&auto=format&fit=crop" 
                  alt="Learner" 
                  className="w-5 h-5 rounded-full border border-surface object-cover" 
                />
              </div>
            </div>

            <span className="text-[11px] font-mono text-muted">
              8 lessons • ₦180 cap
            </span>
          </div>

          {/* Instructor & Verified Badge */}
          <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-rule text-xs">
            <div className="flex items-center gap-2">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=60&auto=format&fit=crop" 
                alt="Alex Chen" 
                className="w-6 h-6 rounded-full object-cover border border-rule" 
              />
              <span className="font-semibold text-ink text-xs">Alex Chen</span>
            </div>
            <VerifiedStamp />
          </div>

        </div>

      </div>

    </div>
  );
}
