"use client";
import { ReactNode, useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Sparkles, User, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Initialize from path to avoid hydration mismatch
  const [role, setRole] = useState<'creator' | 'learner'>(
    pathname?.includes('/creator') ? 'creator' : 'learner'
  );

  useEffect(() => {
    if (pathname?.includes('/creator')) {
      setRole('creator');
      localStorage.setItem('rheodemy_role', 'creator');
    } else if (pathname?.includes('/learner')) {
      setRole('learner');
      localStorage.setItem('rheodemy_role', 'learner');
    } else {
      // On shared routes like /wallet, fallback to stored role
      const stored = localStorage.getItem('rheodemy_role') as 'creator' | 'learner';
      if (stored) setRole(stored);
    }
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const isCreator = role === 'creator';

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Subtle Background Texture / Light Source */}
      <div className="absolute top-0 inset-x-0 h-[800px] pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/[0.03] via-transparent to-transparent z-0" />
      <div className="absolute -top-[500px] -right-[500px] w-[1000px] h-[1000px] rounded-full pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/[0.02] via-transparent to-transparent z-0 blur-3xl" />
      
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between relative z-10">
            {/* Logo */}
            <Link href={isCreator ? "/dashboard/creator" : "/dashboard/learner"} className="flex-shrink-0 flex items-center">
              <img src="/logo.png" alt="Rheodemy Logo" className="h-14 sm:h-16 w-auto object-contain drop-shadow-md" />
            </Link>
            
            {/* Center Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {isCreator ? (
                <>
                  <Link href="/dashboard/creator" className={`text-sm font-medium transition-colors ${pathname === '/dashboard/creator' ? 'text-foreground' : 'text-muted hover:text-foreground'}`}>
                    Overview
                  </Link>
                  <Link href="/coming-soon" className="text-sm font-medium text-muted hover:text-foreground transition-colors">
                    Courses
                  </Link>
                  <Link href="/dashboard/wallet" className={`text-sm font-medium transition-colors ${pathname === '/dashboard/wallet' ? 'text-foreground' : 'text-muted hover:text-foreground'}`}>
                    Wallet
                  </Link>
                  <Link href="/coming-soon" className="text-sm font-medium text-muted hover:text-foreground transition-colors">
                    Analytics
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/dashboard/learner" className={`text-sm font-medium transition-colors ${pathname === '/dashboard/learner' ? 'text-foreground' : 'text-muted hover:text-foreground'}`}>
                    Discover
                  </Link>
                  <Link href="/coming-soon" className="text-sm font-medium text-muted hover:text-foreground transition-colors">
                    My Learning
                  </Link>
                  <Link href="/dashboard/wallet" className={`text-sm font-medium transition-colors ${pathname === '/dashboard/wallet' ? 'text-foreground' : 'text-muted hover:text-foreground'}`}>
                    Wallet
                  </Link>
                </>
              )}
            </nav>
            
            {/* Right side Profile */}
            <div className="flex items-center gap-4">
              {!isCreator && (
                <Link href="/become-creator" className="hidden sm:flex text-sm font-bold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 px-4 py-2 rounded-full transition-all items-center gap-2 shadow-[0_0_15px_rgba(0,212,200,0.1)] hover:shadow-[0_0_20px_rgba(0,212,200,0.2)]">
                  <Sparkles className="w-4 h-4" /> Start Earning
                </Link>
              )}
              <Link href="/coming-soon" className="text-sm font-medium text-muted hover:text-foreground transition-colors hidden sm:block">
                Settings
              </Link>
              
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="h-10 w-10 rounded-full flex items-center justify-center bg-white/5 border border-white/10 hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <User className="w-5 h-5 text-foreground/80" />
                </button>
                
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#0A0A0A] border border-white/10 shadow-2xl py-1 z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/5">
                      <p className="text-sm font-medium text-foreground truncate">
                        Account Options
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
