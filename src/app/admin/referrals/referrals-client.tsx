"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { Table, TBody, TD, TH, THead, TR } from "~/components/ui/table";
import { Modal } from "~/components/ui/modal";
import { Input } from "~/components/ui/input";
import { toast } from "sonner";
import { LayoutGrid, List as ListIcon } from "lucide-react";

export type Referral = {
  id: string;
  userId: string;
  userEmail: string;
  code: string;
  commissionRate: number; // 0..1
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

export default function ReferralsClient({ initialData }: { initialData: Referral[] }) {
  const [items, setItems] = useState<Referral[]>(initialData);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Referral | null>(null);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  // list vs cards view (cards enforced on small screens via CSS)
  const [view, setView] = useState<"list" | "cards">(() => {
    if (typeof window === "undefined") return "list";
    return (window.localStorage.getItem("admin_referrals_view") as "list" | "cards") || "list";
  });
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("admin_referrals_view", view);
    }
  }, [view]);
  const abortRef = useRef<AbortController | null>(null);
  const [form, setForm] = useState({
    userId: "",
    code: "",
    commissionRate: "0.1",
  });

  const resetForm = () => {
    setForm({ userId: "", code: "", commissionRate: "0.1" });
    setEditing(null);
  };

  const openCreate = () => { resetForm(); setOpen(true); toast("New referral"); };
  const openEdit = (r: Referral) => {
    setEditing(r);
    setForm({ userId: r.userId, code: r.code, commissionRate: String(r.commissionRate) });
    setOpen(true);
    toast(`Editing ${r.userEmail}`);
  };

  // Debounced fetch on search
  useEffect(() => {
    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;
    const t = setTimeout(() => {
      void (async () => {
        try {
          const url = q ? `/api/admin/referrals?q=${encodeURIComponent(q)}` : "/api/admin/referrals";
          const res = await fetch(url, { signal: controller.signal });
          const raw: unknown = await res.json();
          const json = raw as { data: Referral[]; error?: unknown };
          if (!res.ok) throw new Error(typeof json.error === "string" ? json.error : "Failed to load referrals");
          setItems(json.data);
          if (q) {
            toast(`Found ${json.data.length} referral${json.data.length === 1 ? "" : "s"}`);
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

  async function onSubmit() {
    setLoading(true);
    try {
      const payload = {
        userId: form.userId,
        code: form.code || undefined,
        commissionRate: form.commissionRate === "" ? undefined : Number(form.commissionRate),
      };

      if (editing) {
        const res = await fetch(`/api/admin/referrals/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: payload.code, commissionRate: payload.commissionRate }),
        });
        const raw: unknown = await res.json();
        const json = raw as { data: Referral; error?: unknown };
        if (!res.ok) throw new Error(fmtError(json.error) || "Failed to update referral");
        setItems((prev) => prev.map((p) => (p.id === editing.id ? json.data : p)));
        toast.success("Referral updated");
      } else {
        const res = await fetch(`/api/admin/referrals`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const raw: unknown = await res.json();
        const json = raw as { data: Referral; error?: unknown };
        if (!res.ok) throw new Error(fmtError(json.error) || "Failed to create referral");
        setItems((prev) => [json.data, ...prev]);
        toast.success("Referral created");
      }
      setOpen(false);
      resetForm();
    } catch (err) {
      console.error(err);
      toast.error(fmtError(err));
    } finally { setLoading(false); }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this referral?")) return;
    try {
      const res = await fetch(`/api/admin/referrals/${id}`, { method: "DELETE" });
      const raw: unknown = await res.json();
      const json = raw as { error?: unknown };
      if (!res.ok) throw new Error(fmtError(json.error) || "Failed to delete referral");
      setItems((prev) => prev.filter((x) => x.id !== id));
      toast.success("Referral deleted");
    } catch (err) {
      console.error(err);
      toast.error(fmtError(err));
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Referrals</h1>
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
          placeholder="Search by email or code..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-xs"
        />
        <Button onClick={openCreate}>Add Referral</Button>
      </div>

      {/* Table (desktop list view only) */}
      <div className={view === "list" ? "hidden md:block" : "hidden"}>
        <div className="overflow-x-auto">
          <Table>
          <THead>
            <TR>
              <TH>User Email</TH>
              <TH>Code</TH>
              <TH>Commission</TH>
              <TH>Created</TH>
              <TH className="text-right">Actions</TH>
            </TR>
          </THead>
          <TBody>
            {items.map((r) => (
              <TR key={r.id}>
                <TD>{r.userEmail}</TD>
                <TD>{r.code}</TD>
                <TD>{(r.commissionRate * 100).toFixed(0)}%</TD>
                <TD>{new Date(r.createdAt).toLocaleString()}</TD>
                <TD className="text-right space-x-2">
                  <Button variant="secondary" size="sm" onClick={() => openEdit(r)}>Edit</Button>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(r.id)}>Delete</Button>
                </TD>
              </TR>
            ))}
          </TBody>
          </Table>
        </div>
      </div>

      {/* Cards (always visible on small; on md+ only when cards selected) */}
      <div className={view === "list" ? "grid grid-cols-1 gap-4 md:hidden sm:grid-cols-2" : "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"}>
        {items.map((r) => (
          <div key={r.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">{r.userEmail}</h3>
                <p className="text-xs text-slate-500">Code: {r.code}</p>
              </div>
              <div className="text-right font-semibold">{(r.commissionRate * 100).toFixed(0)}%</div>
            </div>
            <div className="mt-2 text-xs text-slate-500">Created: {new Date(r.createdAt).toLocaleDateString()}</div>
            <div className="mt-3 flex items-center justify-end text-xs text-slate-500">
              <div className="space-x-2">
                <Button variant="secondary" size="sm" onClick={() => openEdit(r)}>Edit</Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(r.id)}>Delete</Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={open}
        onClose={() => { setOpen(false); resetForm(); }}
        title={editing ? "Edit Referral" : "Add Referral"}
      >
        <div className="grid gap-3">
          <label className="grid gap-1">
            <span className="text-sm">User ID</span>
            <Input value={form.userId} onChange={(e) => setForm((f) => ({ ...f, userId: e.target.value }))} disabled={!!editing} />
          </label>
          <label className="grid gap-1">
            <span className="text-sm">Code (leave blank to auto-generate)</span>
            <Input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
          </label>
          <label className="grid gap-1">
            <span className="text-sm">Commission Rate (0..1)</span>
            <Input type="number" step="0.01" min="0" max="1" value={form.commissionRate} onChange={(e) => setForm((f) => ({ ...f, commissionRate: e.target.value }))} />
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
