"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Button } from "~/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "~/contexts/ThemeContext";

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/blogs", label: "Blogs" },
  { href: "/admin/coupons", label: "Coupons" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/referrals", label: "Referrals" },
  { href: "/admin/payouts", label: "Payouts" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="flex min-h-[70vh] gap-6 p-4">
      <aside className="w-56 shrink-0 border-r border-slate-200 pr-3 dark:border-slate-800">
        <div className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Admin
        </div>
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
          <span>Theme</span>
        </button>
        <nav className="flex flex-col gap-2">
          {nav.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href} prefetch={false} className="w-full">
                <Button
                  variant={active ? "primary" : "ghost"}
                  className="w-full justify-start"
                >
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  );
}
