"use client";

import { ReactNode, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Wallet, 
  Compass, 
  Sun, 
  Moon, 
  LogOut, 
  ArrowRightLeft, 
  BookOpen 
} from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { useTheme } from "@/context/ThemeContext";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const [role, setRole] = useState<"creator" | "learner">("learner");
  const [userName, setUserName] = useState<string>("Amara Okafor");
  const [walletBalance, setWalletBalance] = useState<number>(1200.0);

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase() || "LR";
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const storedName = localStorage.getItem("rheodemy_user_name");
      if (storedName && storedName.trim()) {
        setUserName(storedName.trim());
      }
      const storedRole = localStorage.getItem("rheodemy_role");
      if (storedRole === "creator" || storedRole === "learner") {
        setRole(storedRole);
      }
      const storedBalance = localStorage.getItem("rheodemy_wallet_balance");
      if (storedBalance) {
        setWalletBalance(parseFloat(storedBalance));
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Sync role if pathname explicitly changes between /creator and /learner
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pathname?.includes("/creator")) {
        setRole("creator");
        localStorage.setItem("rheodemy_role", "creator");
      } else if (pathname?.includes("/learner")) {
        setRole("learner");
        localStorage.setItem("rheodemy_role", "learner");
      }
      
      const storedBalance = localStorage.getItem("rheodemy_wallet_balance");
      if (storedBalance) {
        setWalletBalance(parseFloat(storedBalance));
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [pathname]);

  // Handle clicking outside user dropdown or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isMenuOpen]);

  const isCreator = role === "creator";

  return (
    <div className="min-h-screen bg-paper text-ink font-sans flex flex-col selection:bg-sun/30">
      
      {/* 🧭 EDITORIAL LEDGER TOP NAVIGATION */}
      <header className="sticky top-0 z-40 w-full border-b border-rule bg-paper/95 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-18 items-center justify-between gap-4">
            
            {/* Left: Brand Identity */}
            <div className="flex items-center gap-6">
              <BrandLogo size="md" href={isCreator ? "/dashboard/creator" : "/dashboard/learner"} />
            </div>
            
            {/* Center Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1 sm:space-x-2 text-xs font-semibold">
              {isCreator ? (
                <>
                  <Link 
                    href="/dashboard/creator" 
                    className={`px-3 py-2 rounded-[4px] transition-colors ${
                      pathname === "/dashboard/creator" 
                        ? "bg-surface border border-rule text-ink shadow-xs" 
                        : "text-muted hover:text-ink"
                    }`}
                  >
                    Overview
                  </Link>
                  <Link 
                    href="/dashboard/creator/upload" 
                    className={`px-3 py-2 rounded-[4px] transition-colors ${
                      pathname === "/dashboard/creator/upload" 
                        ? "bg-surface border border-rule text-ink shadow-xs" 
                        : "text-muted hover:text-ink"
                    }`}
                  >
                    Publish Course
                  </Link>
                  <Link 
                    href="/dashboard/wallet" 
                    className={`px-3 py-2 rounded-[4px] transition-colors ${
                      pathname === "/dashboard/wallet" 
                        ? "bg-surface border border-rule text-ink shadow-xs" 
                        : "text-muted hover:text-ink"
                    }`}
                  >
                    Royalties Ledger
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    href="/dashboard/learner" 
                    className={`px-3 py-2 rounded-[4px] transition-colors flex items-center gap-1.5 ${
                      pathname === "/dashboard/learner" 
                        ? "bg-surface border border-rule text-ink shadow-xs" 
                        : "text-muted hover:text-ink"
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Discover Catalog</span>
                  </Link>
                  <Link 
                    href="/dashboard/wallet" 
                    className={`px-3 py-2 rounded-[4px] transition-colors flex items-center gap-1.5 ${
                      pathname === "/dashboard/wallet" 
                        ? "bg-surface border border-rule text-ink shadow-xs" 
                        : "text-muted hover:text-ink"
                    }`}
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    <span>Wallet & Receipts</span>
                  </Link>
                </>
              )}
            </nav>
            
            {/* Right: Wallet Balance Pill & Profile */}
            <div className="flex items-center gap-3 sm:gap-4">
              
              {/* Wallet Live Pill */}
              <Link
                href="/dashboard/wallet"
                className="ledger-card px-3 py-1.5 bg-surface border border-rule hover:border-forest flex items-center gap-2 transition-colors cursor-pointer"
                title="View Interledger Wallet & Deposit Rails"
              >
                <span className="w-2 h-2 rounded-full bg-forest animate-pulse" />
                <div className="flex flex-col text-left">
                  <span className="text-[9px] font-mono uppercase text-muted leading-none">Wallet</span>
                  <span className="font-mono text-xs font-bold text-ink leading-tight" suppressHydrationWarning>
                    ₦{walletBalance.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </Link>

              {/* Creator Mode Switcher */}
              {!isCreator && (
                <Link 
                  href="/role" 
                  className="hidden lg:flex text-xs font-semibold text-muted hover:text-ink transition-colors px-2"
                >
                  Switch Role
                </Link>
              )}

              {/* User Avatar with Dropdown Menu */}
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen((prev) => !prev)}
                  className="w-9 h-9 rounded-full border border-rule bg-surface hover:border-forest flex items-center justify-center font-mono text-xs font-bold text-ink transition-all cursor-pointer shadow-xs focus:outline-hidden focus:ring-2 focus:ring-forest/30"
                  aria-label="User profile and settings"
                  aria-expanded={isMenuOpen}
                  suppressHydrationWarning
                >
                  <span suppressHydrationWarning>{isCreator ? "ED" : getInitials(userName)}</span>
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-[8px] bg-surface border border-rule shadow-xl py-2 z-50 text-xs animate-in fade-in duration-150">
                    {/* User Header */}
                    <div className="px-4 py-2.5 border-b border-rule flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-forest text-white flex items-center justify-center font-mono text-xs font-bold shrink-0" suppressHydrationWarning>
                        {isCreator ? "ED" : getInitials(userName)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-serif font-bold text-sm text-ink truncate" suppressHydrationWarning>
                          {userName}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] font-mono px-1.5 py-0.2 bg-forest/10 text-forest rounded font-medium">
                            {isCreator ? "Educator" : "Learner"}
                          </span>
                          <span className="text-[10px] text-muted truncate">
                            {isCreator ? "Creator Desk" : "Self-Custody"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Wallet Balance Strip */}
                    <div className="px-4 py-2 border-b border-rule bg-paper/50 flex items-center justify-between">
                      <span className="text-muted text-[11px]">Interledger Balance:</span>
                      <span className="font-mono font-bold text-forest text-xs" suppressHydrationWarning>
                        ₦{walletBalance.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    {/* Nav Actions */}
                    <div className="py-1">
                      <Link
                        href="/dashboard/wallet"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-ink hover:bg-paper transition-colors"
                      >
                        <Wallet className="w-3.5 h-3.5 text-muted" />
                        <span>Wallet & Receipts</span>
                      </Link>

                      {isCreator ? (
                        <Link
                          href="/dashboard/learner"
                          onClick={() => {
                            setRole("learner");
                            localStorage.setItem("rheodemy_role", "learner");
                            setIsMenuOpen(false);
                          }}
                          className="flex items-center gap-2.5 px-4 py-2 text-ink hover:bg-paper transition-colors"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-muted" />
                          <span>Switch to Learner Desk</span>
                        </Link>
                      ) : (
                        <Link
                          href="/become-creator"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-ink hover:bg-paper transition-colors"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5 text-muted" />
                          <span>Educator Portal & Creator Desk</span>
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-rule my-1" />

                    {/* Theme Toggle (Light / Dark) */}
                    <div className="px-4 py-2 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-ink">
                        {theme === "dark" ? (
                          <Moon className="w-3.5 h-3.5 text-muted" />
                        ) : (
                          <Sun className="w-3.5 h-3.5 text-muted" />
                        )}
                        <span>Theme</span>
                      </div>
                      <button
                        type="button"
                        onClick={toggleTheme}
                        className="px-2.5 py-1 rounded border border-rule bg-paper hover:bg-forest/10 hover:text-forest text-[11px] font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>{theme === "dark" ? "Dark Mode" : "Light Mode"}</span>
                      </button>
                    </div>

                    <div className="border-t border-rule my-1" />

                    {/* Sign Out */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        if (typeof window !== "undefined") {
                          localStorage.removeItem("rheodemy_user_name");
                          localStorage.removeItem("rheodemy_auth_mode");
                        }
                        router.push("/auth");
                      }}
                      className="w-full text-start flex items-center gap-2.5 px-4 py-2 text-clay hover:bg-clay/5 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-clay" />
                      <span>Log out</span>
                    </button>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      </header>

      {/* 🏛️ MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {children}
      </main>

    </div>
  );
}