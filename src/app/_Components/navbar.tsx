'use client';

import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import AnimatedLogo from '~/components/AnimatedLogo';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '~/contexts/ThemeContext';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-black/30">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2">
          <AnimatedLogo />
          <span className="hidden select-none bg-[linear-gradient(90deg,#60a5fa,#a78bfa,#34d399,#60a5fa)] bg-[length:200%_100%] bg-clip-text font-semibold tracking-tight text-transparent sm:inline-block animate-[shimmer_6s_linear_infinite]">
            KAMKM Serve
          </span>
        </Link>

        {/* Links (optional/minimal) */}
        <div className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/40 px-2 py-1 shadow-sm backdrop-blur md:flex dark:bg-white/5">
          <Link
            href="/"
            className="rounded-full px-3 py-1 text-sm text-black/70 transition hover:bg-black/5 hover:text-black dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white"
          >
            Home
          </Link>
          <Link
            href="/about"
            prefetch={false}
            className="rounded-full px-3 py-1 text-sm text-black/70 transition hover:bg-black/5 hover:text-black dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white"
          >
            About
          </Link>
          <Link
            href="/contact"
            prefetch={false}
            className="rounded-full px-3 py-1 text-sm text-black/70 transition hover:bg-black/5 hover:text-black dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white"
          >
            Contact
          </Link>
          <SignedIn>
            <Link
              href="/protected"
              className="rounded-full px-3 py-1 text-sm text-black/80 transition hover:bg-black/5 hover:text-black dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-white"
            >
              Dashboard
            </Link>
          </SignedIn>
        </div>

        {/* Auth + Theme */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="rounded-full p-2 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 text-amber-400" />
            ) : (
              <Moon className="h-5 w-5 text-black/70 dark:text-white/70" />
            )}
          </button>
          <SignedOut>
            <Link
              href="/sign-up"
              className="hidden rounded-full border border-black/10 bg-white/70 px-3 py-1.5 text-sm text-black/80 shadow-sm transition hover:shadow md:inline-block dark:border-white/15 dark:bg-white/10 dark:text-white/90 dark:hover:bg-white/15"
            >
              Sign up
            </Link>
            <SignInButton mode="modal">
              <button className="rounded-full border border-black/10 bg-white/70 px-3 py-1.5 text-sm text-black/80 shadow-sm transition hover:shadow md:px-3.5 dark:border-white/15 dark:bg-white/10 dark:text-white/90 dark:hover:bg-white/15">
                Sign in
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox:
                    'ring-1 ring-black/10 dark:ring-white/20 rounded-full',
                },
              }}
            />
          </SignedIn>
        </div>
      </div>

      {/* Local keyframes for shimmer */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </nav>
  );
}