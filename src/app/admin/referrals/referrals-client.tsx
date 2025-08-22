"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { Table, TBody, TD, TH, THead, TR } from "~/components/ui/table";
import { Modal } from "~/components/ui/modal";
import { Input } from "~/components/ui/input";
import { toast } from "sonner";

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

  const openCreate = () => { resetForm(); setOpen(true); };
  const openEdit = (r: Referral) => {
    setEditing(r);
    setForm({ userId: r.userId, code: r.code, commissionRate: String(r.commissionRate) });
    setOpen(true);
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
        <Input
          placeholder="Search by email or code..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-xs"
        />
        <Button onClick={openCreate}>Add Referral</Button>
      </div>

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
