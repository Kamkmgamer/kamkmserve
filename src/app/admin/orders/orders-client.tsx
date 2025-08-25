"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { Table, TBody, TD, TH, THead, TR } from "~/components/ui/table";
import Link from "next/link";
import { Input } from "~/components/ui/input";
import { toast } from "sonner";
import { LayoutGrid, List as ListIcon } from "lucide-react";

export type OrderRow = {
  id: string;
  userEmail: string;
  totalAmount: number;
  status:
    | "PENDING"
    | "PAID"
    | "IN_TECHNICAL_REVIEW"
    | "APPROVED"
    | "FAILED"
    | "REFUNDED"
    | "CANCELED";
  couponCode: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

const STATUSES: OrderRow["status"][] = [
  "PENDING",
  "PAID",
  "IN_TECHNICAL_REVIEW",
  "APPROVED",
  "FAILED",
  "REFUNDED",
  "CANCELED",
];

export default function OrdersClient({ initialData }: { initialData: OrderRow[] }) {
  const [items, setItems] = useState<OrderRow[]>(initialData);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  // list vs cards view (cards enforced on small screens via CSS)
  const [view, setView] = useState<"list" | "cards">(() => {
    if (typeof window === "undefined") return "list";
    return (window.localStorage.getItem("admin_orders_view") as "list" | "cards") || "list";
  });
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("admin_orders_view", view);
    }
  }, [view]);
  const abortRef = useRef<AbortController | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");

  function fmtError(e: unknown): string {
    try {
      if (!e) return "Unknown error";
      if (typeof e === "string") return e;
      if (e instanceof Error) return e.message;
      return JSON.stringify(e);
    } catch {
      return "Unknown error";
    }
  }

  async function downloadCsv(url: string, filename: string) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to download CSV (${res.status})`);
      const blob = await res.blob();
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(href);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : String(err));
    }
  }

  // Fetch with search + filters (debounced)
  useEffect(() => {
    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;
    const t = setTimeout(() => {
      void (async () => {
        try {
          const params = new URLSearchParams();
          if (q) params.set("q", q);
          if (statusFilter) params.set("status", statusFilter);
          const url = params.toString() ? `/api/admin/orders?${params.toString()}` : "/api/admin/orders";
          const res = await fetch(url, { signal: controller.signal });
          const raw: unknown = await res.json();
          const json = raw as { data: OrderRow[]; error?: unknown };
          if (!res.ok) {
            const msg = typeof json.error === "string" ? json.error : "Failed to load orders";
            throw new Error(msg);
          }
          setItems(json.data);
        } catch (err) {
          if (err instanceof Error && err.name === "AbortError") return;
          console.error(err);
        }
      })();
    }, 250);
    return () => {
      controller.abort();
      clearTimeout(t);
    };
  }, [q, statusFilter]);

  async function onChangeStatus(id: string, status: OrderRow["status"]) {
    setSavingId(id);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const raw: unknown = await res.json();
      const json = raw as { data: OrderRow; error?: unknown };
      if (!res.ok) throw new Error(fmtError(json.error) || "Failed to update order");
      setItems((prev) => prev.map((o) => (o.id === id ? json.data : o)));
    } catch (err) {
      console.error(err);
      toast.error(fmtError(err));
    } finally {
      setSavingId(null);
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Orders</h1>
        <div className="flex-1" />
        {/* View toggle (effective on md+; small screens always show cards) */}
        <div className="hidden items-center gap-1 md:flex" role="group" aria-label="View mode">
          <Button
            variant={view === "list" ? "primary" : "ghost"}
            size="sm"
            aria-pressed={view === "list"}
            onClick={() => setView("list")}
            title="List view"
          >
            <ListIcon className="h-4 w-4" />
          </Button>
          <Button
            variant={view === "cards" ? "primary" : "ghost"}
            size="sm"
            aria-pressed={view === "cards"}
            onClick={() => setView("cards")}
            title="Card view"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
        <Input
          placeholder="Search email, coupon, or order id..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-xs"
        />
        <select
          className="border rounded px-2 py-1"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <Button variant="outline" onClick={() => downloadCsv("/api/admin/orders/export", "orders.csv")}>Export CSV</Button>
      </div>

      {/* Table (desktop list view only) */}
      <div className={view === "list" ? "hidden md:block" : "hidden"}>
        <div className="overflow-x-auto">
          <Table>
          <THead>
            <TR>
              <TH>User</TH>
              <TH>Total</TH>
              <TH>Status</TH>
              <TH>Coupon</TH>
              <TH>Created</TH>
              <TH className="text-right">Actions</TH>
            </TR>
          </THead>
          <TBody>
            {items.map((o) => (
              <TR key={o.id}>
                <TD>{o.userEmail}</TD>
                <TD>${o.totalAmount}</TD>
                <TD>
                  <select
                    className="border rounded px-2 py-1"
                    value={o.status}
                    onChange={(e) => onChangeStatus(o.id, e.target.value as OrderRow["status"]) }
                    disabled={savingId === o.id}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </TD>
                <TD>{o.couponCode ?? "—"}</TD>
                <TD>{new Date(o.createdAt).toLocaleString()}</TD>
                <TD className="text-right space-x-2">
                  <Link href={`/admin/orders/${o.id}`}>
                    <Button variant="secondary" size="sm">View</Button>
                  </Link>
                </TD>
              </TR>
            ))}
          </TBody>
          </Table>
        </div>
      </div>

      {/* Cards (always visible on small; on md+ only when cards selected) */}
      <div className={view === "list" ? "grid grid-cols-1 gap-4 md:hidden sm:grid-cols-2" : "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"}>
        {items.map((o) => (
          <div key={o.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">{o.userEmail}</h3>
                <p className="text-xs text-slate-500">Order #{o.id.slice(0, 8)}</p>
              </div>
              <div className="text-right font-semibold">${o.totalAmount}</div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span>Status:</span>
                <select
                  className="border rounded px-2 py-1"
                  value={o.status}
                  onChange={(e) => onChangeStatus(o.id, e.target.value as OrderRow["status"]) }
                  disabled={savingId === o.id}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <span>Coupon: {o.couponCode ?? "—"}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span>Created {new Date(o.createdAt).toLocaleDateString()}</span>
              <div className="space-x-2">
                <Link href={`/admin/orders/${o.id}`}>
                  <Button variant="secondary" size="sm">View</Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
