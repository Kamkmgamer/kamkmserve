"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { Table, TBody, TD, TH, THead, TR } from "~/components/ui/table";
import { Modal } from "~/components/ui/modal";
import { Input } from "~/components/ui/input";
import { toast } from "sonner";
import { LayoutGrid, List as ListIcon } from "lucide-react";

export type Commission = {
  id: string;
  orderId: string;
  referralId: string;
  referralCode: string;
  amount: number;
  status: "UNPAID" | "PENDING" | "PAID" | "FAILED";
  orderTotal: number;
  createdAt: string | Date;
  updatedAt: string | Date;
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

export default function CommissionsClient({ initialData }: { initialData: Commission[] }) {
  const [items, setItems] = useState<Commission[]>(initialData);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Commission | null>(null);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  // list vs cards view (cards enforced on small screens via CSS)
  const [view, setView] = useState<"list" | "cards">(() => {
    if (typeof window === "undefined") return "list";
    return (window.localStorage.getItem("admin_commissions_view") as "list" | "cards") || "list";
  });
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("admin_commissions_view", view);
    }
  }, [view]);
  const abortRef = useRef<AbortController | null>(null);
  const [form, setForm] = useState({
    orderId: "",
    referralId: "",
    amount: "0",
    status: "UNPAID" as Commission["status"],
  });

  // Fetch with search (debounced)
  useEffect(() => {
    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;
    const t = setTimeout(() => {
      void (async () => {
        try {
          const url = q ? `/api/admin/commissions?q=${encodeURIComponent(q)}` : "/api/admin/commissions";
          const res = await fetch(url, { signal: controller.signal });
          const raw: unknown = await res.json();
          const json = raw as { data: Commission[]; error?: unknown };
          if (!res.ok) throw new Error(fmtError(json.error) || "Failed to load commissions");
          setItems(json.data);
          if (q) {
            toast(`Found ${json.data.length} commission${json.data.length === 1 ? "" : "s"}`);
          }
        } catch (err) {
          if (err instanceof Error && err.name === "AbortError") return;
          console.error(err);
          toast.error(fmtError(err));
        }
      })();
    }, 250);
    return () => {
      controller.abort();
      clearTimeout(t);
    };
  }, [q]);

  const resetForm = () => {
    setForm({ orderId: "", referralId: "", amount: "0", status: "UNPAID" });
    setEditing(null);
  };

  const openCreate = () => { resetForm(); setOpen(true); toast("New commission"); };
  const openEdit = (c: Commission) => {
    setEditing(c);
    setForm({ orderId: c.orderId, referralId: c.referralId, amount: String(c.amount), status: c.status });
    setOpen(true);
    toast(`Editing commission #${c.id.slice(0, 8)}`);
  };

  async function onSubmit() {
    setLoading(true);
    try {
      if (editing) {
        const res = await fetch(`/api/admin/commissions/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: Number(form.amount), status: form.status }),
        });
        const raw: unknown = await res.json();
        const json = raw as { data: Commission; error?: unknown };
        if (!res.ok) throw new Error(fmtError(json.error) || "Failed to update commission");
        setItems((prev) => prev.map((p) => (p.id === editing.id ? json.data : p)));
        toast.success("Commission updated");
      } else {
        const res = await fetch(`/api/admin/commissions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: form.orderId, referralId: form.referralId, amount: Number(form.amount), status: form.status }),
        });
        const raw: unknown = await res.json();
        const json = raw as { data: Commission; error?: unknown };
        if (!res.ok) throw new Error(fmtError(json.error) || "Failed to create commission");
        setItems((prev) => [json.data, ...prev]);
        toast.success("Commission created");
      }
      setOpen(false);
      resetForm();
    } catch (err) {
      console.error(err);
      toast.error(fmtError(err));
    } finally { setLoading(false); }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this commission?")) return;
    try {
      const res = await fetch(`/api/admin/commissions/${id}`, { method: "DELETE" });
      const raw: unknown = await res.json();
      const json = raw as { error?: unknown };
      if (!res.ok) throw new Error(fmtError(json.error) || "Failed to delete commission");
      setItems((prev) => prev.filter((x) => x.id !== id));
      toast.success("Commission deleted");
    } catch (err) {
      console.error(err);
      toast.error(fmtError(err));
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Commissions</h1>
        <div className="flex-1" />
        {/* View toggle (effective on md+; small screens always show cards) */}
        <div className="hidden items-center gap-1 md:flex" role="group" aria-label="View mode">
          <Button
            variant={view === "list" ? "primary" : "ghost"}
            size="sm"
            aria-pressed={view === "list"}
            onClick={() => { setView("list"); toast("List view"); }}
            title="List view"
          >
            <ListIcon className="h-4 w-4" />
          </Button>
          <Button
            variant={view === "cards" ? "primary" : "ghost"}
            size="sm"
            aria-pressed={view === "cards"}
            onClick={() => { setView("cards"); toast("Card view"); }}
            title="Card view"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
        <Input
          placeholder="Search referral code or order id..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-xs"
        />
        <Button onClick={openCreate}>Add Commission</Button>
      </div>

      {/* Table (desktop list view only) */}
      <div className={view === "list" ? "hidden md:block" : "hidden"}>
        <div className="overflow-x-auto">
          <Table>
          <THead>
            <TR>
              <TH>Referral Code</TH>
              <TH>Order</TH>
              <TH>Amount</TH>
              <TH>Status</TH>
              <TH>Created</TH>
              <TH className="text-right">Actions</TH>
            </TR>
          </THead>
          <TBody>
            {items.map((c) => (
              <TR key={c.id}>
                <TD>{c.referralCode}</TD>
                <TD>{c.orderId}</TD>
                <TD>${""}{(c.amount / 100).toFixed(2)}</TD>
                <TD>{c.status}</TD>
                <TD>{new Date(c.createdAt).toLocaleString()}</TD>
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
                <h3 className="font-semibold">{c.referralCode}</h3>
                <p className="text-xs text-slate-500">Order #{c.orderId.slice(0, 8)}</p>
              </div>
              <div className="text-right font-semibold">${(c.amount / 100).toFixed(2)}</div>
            </div>
            <div className="mt-2 text-xs text-slate-500">Status: {c.status}</div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span>Created {new Date(c.createdAt).toLocaleDateString()}</span>
              <div className="space-x-2">
                <Button variant="secondary" size="sm" onClick={() => openEdit(c)}>Edit</Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(c.id)}>Delete</Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={open}
        onClose={() => { setOpen(false); resetForm(); }}
        title={editing ? "Edit Commission" : "Add Commission"}
      >
        <div className="grid gap-3">
          <label className="grid gap-1">
            <span className="text-sm">Order ID</span>
            <Input value={form.orderId} onChange={(e) => setForm((f) => ({ ...f, orderId: e.target.value }))} disabled={!!editing} />
          </label>
          <label className="grid gap-1">
            <span className="text-sm">Referral ID</span>
            <Input value={form.referralId} onChange={(e) => setForm((f) => ({ ...f, referralId: e.target.value }))} disabled={!!editing} />
          </label>
          <label className="grid gap-1">
            <span className="text-sm">Amount (cents)</span>
            <Input type="number" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />
          </label>
          <label className="grid gap-1">
            <span className="text-sm">Status</span>
            <Input value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Commission["status"] }))} />
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
