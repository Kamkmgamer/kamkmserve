"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode, type MouseEvent as ReactMouseEvent } from "react";
import { Button } from "~/components/ui/button";
import { Sun, Moon, X, ChevronRight } from "lucide-react";
import { useTheme } from "~/contexts/ThemeContext";

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/blogs", label: "Blogs" },
  { href: "/admin/coupons", label: "Coupons" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/referrals", label: "Referrals" },
  { href: "/admin/commissions", label: "Commissions" },
  { href: "/admin/payouts", label: "Payouts" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const MIN_WIDTH = 180; // px
  const MAX_WIDTH = 480; // px

  const initialWidth = () => {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("adminSidebarWidth");
      const parsed = stored ? parseInt(stored, 10) : NaN;
      if (!Number.isNaN(parsed)) return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, parsed));
    }
    return 224; // default ~ w-56
  };

  const initialCollapsed = () => {
    if (typeof window !== "undefined") {
      return window.localStorage.getItem("adminSidebarCollapsed") === "true";
    }
    return false;
  };

  const [sidebarWidth, setSidebarWidth] = useState<number>(initialWidth);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(initialCollapsed);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [prevWidth, setPrevWidth] = useState<number>(224);
  const asideRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isCollapsed) setPrevWidth(sidebarWidth);
    window.localStorage.setItem("adminSidebarWidth", String(sidebarWidth));
  }, [sidebarWidth, isCollapsed]);

  useEffect(() => {
    window.localStorage.setItem("adminSidebarCollapsed", String(isCollapsed));
  }, [isCollapsed]);

  useEffect(() => {
    if (isResizing) {
      document.body.style.cursor = "col-resize";
    } else {
      document.body.style.cursor = "";
    }
    return () => {
      document.body.style.cursor = "";
    };
  }, [isResizing]);

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!isResizing || !asideRef.current) return;
      const rect = asideRef.current.getBoundingClientRect();
      const next = e.clientX - rect.left;
      setSidebarWidth(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, next)));
    }
    function onMouseUp() {
      setIsResizing(false);
    }
    if (isResizing) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isResizing]);

  const toggleCollapsed = () => {
    if (isCollapsed) {
      setSidebarWidth(prevWidth || 224);
      setIsCollapsed(false);
    } else {
      setPrevWidth(sidebarWidth);
      setIsCollapsed(true);
    }
  };

  const startResizing = (e: ReactMouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsResizing(true);
  };

  return (
    <div className={`flex min-h-[70vh] gap-6 p-4 ${isResizing ? "select-none" : ""}`}>
      {isCollapsed && (
        <button
          onClick={toggleCollapsed}
          aria-label="Open admin sidebar"
          className="self-start rounded border border-slate-200 bg-white px-2 py-1 text-sm text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
        >
          <span className="inline-flex items-center gap-1"><ChevronRight className="h-4 w-4" /> Open</span>
        </button>
      )}
      <aside
        ref={asideRef}
        className={`relative shrink-0 border-r transition-[width] duration-150 ease-in-out ${
          isCollapsed ? "w-0 overflow-hidden border-transparent pr-0" : "pr-3 border-slate-200 dark:border-slate-800"
        }`}
        style={isCollapsed ? undefined : { width: sidebarWidth }}
      >
        {!isCollapsed && (
          <button
            onClick={toggleCollapsed}
            aria-label="Close admin sidebar"
            className="absolute right-2 top-2 inline-flex items-center justify-center rounded p-1.5 text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        )}
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
        {!isCollapsed && (
          <div
            onMouseDown={startResizing}
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize admin sidebar"
            className="absolute right-0 top-0 h-full w-1 cursor-col-resize bg-transparent hover:bg-slate-200 active:bg-slate-200 dark:hover:bg-slate-800 dark:active:bg-slate-800"
          />
        )}
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  );
}
