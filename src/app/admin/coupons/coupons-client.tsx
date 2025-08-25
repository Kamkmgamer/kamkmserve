"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { Table, TBody, TD, TH, THead, TR } from "~/components/ui/table";
import { Modal } from "~/components/ui/modal";
import { Input } from "~/components/ui/input";
import { toast } from "sonner";
import { LayoutGrid, List as ListIcon } from "lucide-react";

export type Coupon = {
  id: string;
  code: string;
  type: string; // percent | fixed
  value: number;
  minOrderAmount: number | null;
  maxUses: number | null;
  currentUses: number;
  active: boolean;
  expiresAt: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export default function CouponsClient({ initialData }: { initialData: Coupon[] }) {
  const [items, setItems] = useState<Coupon[]>(initialData);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  // list vs cards view (cards enforced on small screens via CSS)
  const [view, setView] = useState<"list" | "cards">(() => {
    if (typeof window === "undefined") return "list";
    return (window.localStorage.getItem("admin_coupons_view") as "list" | "cards") || "list";
  });
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("admin_coupons_view", view);
    }
  }, [view]);
  const abortRef = useRef<AbortController | null>(null);
  const [form, setForm] = useState({
    code: "",
    type: "percent",
    value: "",
    minOrderAmount: "",
    maxUses: "",
    active: true,
    expiresAt: "",
  });

  const resetForm = () => {
    setForm({ code: "", type: "percent", value: "", minOrderAmount: "", maxUses: "", active: true, expiresAt: "" });
    setEditing(null);
  };

  const openCreate = () => { resetForm(); setOpen(true); };
  const openEdit = (c: Coupon) => {
    setEditing(c);
    setForm({
      code: c.code,
      type: c.type,
      value: String(c.value),
      minOrderAmount: c.minOrderAmount === null ? "" : String(c.minOrderAmount),
      maxUses: c.maxUses === null ? "" : String(c.maxUses),
      active: c.active,
      expiresAt: c.expiresAt ?? "",
    });
    setOpen(true);
  };

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

  // Fetch with search (debounced)
  useEffect(() => {
    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;
    const t = setTimeout(() => {
      void (async () => {
        try {
          const url = q ? `/api/admin/coupons?q=${encodeURIComponent(q)}` : "/api/admin/coupons";
          const res = await fetch(url, { signal: controller.signal });
          const raw: unknown = await res.json();
          const json = raw as { data: Coupon[]; error?: unknown };
          if (!res.ok) throw new Error(typeof json.error === "string" ? json.error : "Failed to load coupons");
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
  }, [q]);

  async function onSubmit() {
    setLoading(true);
    try {
      const payload = {
        code: form.code,
        type: form.type,
        value: Number(form.value),
        minOrderAmount: form.minOrderAmount === "" ? undefined : Number(form.minOrderAmount),
        maxUses: form.maxUses === "" ? undefined : Number(form.maxUses),
        active: Boolean(form.active),
        expiresAt: form.expiresAt || undefined,
      };
      if (editing) {
        const res = await fetch(`/api/admin/coupons/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const raw: unknown = await res.json();
        const json = raw as { data: Coupon; error?: unknown };
        if (!res.ok) throw new Error(fmtError(json.error) || "Failed to update coupon");
        setItems((prev) => prev.map((p) => (p.id === editing.id ? json.data : p)));
        toast.success("Coupon updated");
      } else {
        const res = await fetch(`/api/admin/coupons`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const raw: unknown = await res.json();
        const json = raw as { data: Coupon; error?: unknown };
        if (!res.ok) throw new Error(fmtError(json.error) || "Failed to create coupon");
        setItems((prev) => [json.data, ...prev]);
        toast.success("Coupon created");
      }
      setOpen(false);
      resetForm();
    } catch (err) {
      console.error(err);
      toast.error(fmtError(err));
    } finally { setLoading(false); }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this coupon?")) return;
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
      const raw: unknown = await res.json();
      const json = raw as { error?: unknown };
      if (!res.ok) throw new Error(fmtError(json.error) || "Failed to delete coupon");
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch (err) {
      console.error(err);
      toast.error(fmtError(err));
    }
  }

  async function onToggleActive(c: Coupon) {
    try {
      const res = await fetch(`/api/admin/coupons/${c.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !c.active }),
      });
      const raw: unknown = await res.json();
      const json = raw as { data: Coupon; error?: unknown };
      if (!res.ok) throw new Error(fmtError(json.error) || "Failed to update active state");
      setItems((prev) => prev.map((x) => (x.id === c.id ? json.data : x)));
    } catch (err) {
      console.error(err);
      toast.error(fmtError(err));
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Coupons</h1>
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
          placeholder="Search code or type..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-xs"
        />
        <Button onClick={openCreate}>Add Coupon</Button>
      </div>

      {/* Table (desktop list view only) */}
      <div className={view === "list" ? "hidden md:block" : "hidden"}>
        <div className="overflow-x-auto">
          <Table>
          <THead>
            <TR>
              <TH>Code</TH>
              <TH>Type</TH>
              <TH>Value</TH>
              <TH>Usage</TH>
              <TH>Active</TH>
              <TH>Expires</TH>
              <TH className="text-right">Actions</TH>
            </TR>
          </THead>
          <TBody>
            {items.map((c) => (
              <TR key={c.id}>
                <TD>{c.code}</TD>
                <TD>{c.type}</TD>
                <TD>{c.type === "percent" ? `${c.value}%` : `$${c.value}`}</TD>
                <TD>
                  {c.currentUses}
                  {c.maxUses !== null ? ` / ${c.maxUses}` : ""}
                </TD>
                <TD>
                  <span className="mr-2">{c.active ? "Yes" : "No"}</span>
                  <Button variant="ghost" size="sm" onClick={() => onToggleActive(c)}>
                    {c.active ? "Disable" : "Enable"}
                  </Button>
                </TD>
                <TD>{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "—"}</TD>
                <TD className="text-right space-x-2">
                  <Button variant="secondary" size="sm" onClick={() => openEdit(c)}>Edit</Button>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(c.id)}>Delete</Button>
                </TD>
              </TR>
            ))}
          </TBody>
          </Table>
        </div>
      </div>

      {/* Cards (always visible on small; on md+ only when cards selected) */}
      <div className={view === "list" ? "grid grid-cols-1 gap-4 md:hidden sm:grid-cols-2" : "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"}>
        {items.map((c) => (
          <div key={c.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">{c.code}</h3>
                <p className="text-xs text-slate-500">{c.type === "percent" ? `${c.value}% off` : `$${c.value} off`}</p>
              </div>
              <div className="text-right text-xs text-slate-500">
                <div>
                  Uses: {c.currentUses}
                  {c.maxUses !== null ? ` / ${c.maxUses}` : ""}
                </div>
                <div className={c.active ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                  {c.active ? "Active" : "Inactive"}
                </div>
              </div>
            </div>
            {c.expiresAt ? (
              <p className="mt-2 text-xs text-slate-500">Expires {new Date(c.expiresAt).toLocaleDateString()}</p>
            ) : (
              <p className="mt-2 text-xs text-slate-500">No expiration</p>
            )}
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <span>Created {new Date(c.createdAt).toLocaleDateString()}</span>
              <div className="space-x-2">
                <Button variant="secondary" size="sm" onClick={() => openEdit(c)}>Edit</Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(c.id)}>Delete</Button>
                <Button variant="ghost" size="sm" onClick={() => onToggleActive(c)}>{c.active ? "Disable" : "Enable"}</Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={open}
        onClose={() => { setOpen(false); resetForm(); }}
        title={editing ? "Edit Coupon" : "Add Coupon"}
      >
        <div className="grid gap-3">
          <label className="grid gap-1">
            <span className="text-sm">Code</span>
            <Input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
          </label>
          <label className="grid gap-1">
            <span className="text-sm">Type (percent or fixed)</span>
            <Input value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} />
          </label>
          <label className="grid gap-1">
            <span className="text-sm">Value</span>
            <Input type="number" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} />
          </label>
          <label className="grid gap-1">
            <span className="text-sm">Min Order Amount</span>
            <Input type="number" value={form.minOrderAmount} onChange={(e) => setForm((f) => ({ ...f, minOrderAmount: e.target.value }))} />
          </label>
          <label className="grid gap-1">
            <span className="text-sm">Max Uses</span>
            <Input type="number" value={form.maxUses} onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))} />
          </label>
          <label className="grid gap-1">
            <span className="text-sm">Active</span>
            <Input value={form.active ? "true" : "false"} onChange={(e) => setForm((f) => ({ ...f, active: e.target.value === "true" }))} />
          </label>
          <label className="grid gap-1">
            <span className="text-sm">Expires At (ISO date e.g. 2025-12-31)</span>
            <Input value={form.expiresAt} onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))} />
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => { setOpen(false); resetForm(); }} disabled={loading}>Cancel</Button>
            <Button onClick={onSubmit} disabled={loading}>{editing ? "Save" : "Create"}</Button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
