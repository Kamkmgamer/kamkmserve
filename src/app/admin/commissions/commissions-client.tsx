"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { Table, TBody, TD, TH, THead, TR } from "~/components/ui/table";
import { Modal } from "~/components/ui/modal";
import { Input } from "~/components/ui/input";

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

  const resetForm = () => {
    setForm({ orderId: "", referralId: "", amount: "0", status: "UNPAID" });
    setEditing(null);
  };

  const openCreate = () => { resetForm(); setOpen(true); };
  const openEdit = (c: Commission) => {
    setEditing(c);
    setForm({ orderId: c.orderId, referralId: c.referralId, amount: String(c.amount), status: c.status });
    setOpen(true);
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
      }
      setOpen(false);
      resetForm();
    } catch (err) {
      console.error(err);
      alert(fmtError(err));
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
    } catch (err) {
      console.error(err);
      alert(fmtError(err));
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Commissions</h1>
        <div className="flex-1" />
        <Input
          placeholder="Search referral code or order id..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-xs"
        />
        <Button onClick={openCreate}>Add Commission</Button>
      </div>

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
