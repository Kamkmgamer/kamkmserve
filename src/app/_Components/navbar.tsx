'use client';

import Link from 'next/link';
import { useState } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import AnimatedLogo from '~/components/AnimatedLogo';
import { Sun, Moon, Menu, X, ShoppingCart } from 'lucide-react';
import { useTheme } from '~/contexts/ThemeContext';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
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
            href="/services"
            className="rounded-full px-3 py-1 text-sm text-black/70 transition hover:bg-black/5 hover:text-black dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white"
          >
            Services
          </Link>
        </div>

        {/* Auth + Theme */}
        <div className="flex items-center gap-2">
          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
            className="rounded-full p-2 transition-colors hover:bg-black/5 md:hidden dark:hover:bg-white/10"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

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
          {/* Cart */}
          <Link
            href="/cart"
            aria-label="Cart"
            className="rounded-full p-2 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
          >
            <ShoppingCart className="h-5 w-5 text-black/70 dark:text-white/70" />
          </Link>
          <SignedOut>
            <Link
              href="/sign-up"
              className="hidden rounded-full border border-black/10 bg-white/70 px-3 py-1.5 text-sm text-black/80 shadow-sm transition hover:shadow md:inline-block dark:border-white/15 dark:bg-white/10 dark:text-white/90 dark:hover:bg-white/15"
            >
              Sign up
            </Link>
            <SignInButton mode="modal">
              <button className={["rounded-full border border-black/10 bg-white/70 px-3 py-1.5 text-sm text-black/80 shadow-sm transition hover:shadow md:px-3.5 dark:border-white/15 dark:bg-white/10 dark:text-white/90 dark:hover:bg-white/15", open ? "hidden" : ""].join(" ")}>
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

      {/* Mobile menu panel */}
      {open && (
        <div className="md:hidden border-t border-black/10 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-black/40">
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-1">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-black/80 transition hover:bg-black/5 dark:text-white/85 dark:hover:bg-white/10"
              >
                Home
              </Link>
              <Link
                href="/services"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-black/80 transition hover:bg-black/5 dark:text-white/85 dark:hover:bg-white/10"
              >
                Services
              </Link>
              <Link
                href="/cart"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-black/80 transition hover:bg-black/5 dark:text-white/85 dark:hover:bg-white/10"
              >
                Cart
              </Link>
              <div className="mt-1 flex items-center gap-2">
                <SignedOut>
                  <Link
                    href="/sign-up"
                    onClick={() => setOpen(false)}
                    className="rounded-full border border-black/10 bg-white/70 px-3 py-1.5 text-sm text-black/80 shadow-sm transition hover:shadow dark:border-white/15 dark:bg-white/10 dark:text-white/90 dark:hover:bg-white/15"
                  >
                    Sign up
                  </Link>
                  <SignInButton mode="modal">
                    <button
                      onClick={() => setOpen(false)}
                      className="rounded-full border border-black/10 bg-white/70 px-3 py-1.5 text-sm text-black/80 shadow-sm transition hover:shadow dark:border-white/15 dark:bg-white/10 dark:text-white/90 dark:hover:bg-white/15"
                    >
                      Sign in
                    </button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: 'ring-1 ring-black/10 dark:ring-white/20 rounded-full',
                      },
                    }}
                  />
                </SignedIn>
              </div>
            </div>
          </div>
        </div>
      )}

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