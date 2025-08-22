"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { Table, TBody, TD, TH, THead, TR } from "~/components/ui/table";
import { Modal } from "~/components/ui/modal";
import { Input } from "~/components/ui/input";
import { toast } from "sonner";

export type Payout = {
  id: string;
  referralId: string;
  referralCode: string;
  amount: number;
  status: "PENDING" | "PAID" | "FAILED" | "UNPAID";
  payoutDate: string | Date | null;
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

export default function PayoutsClient({ initialData }: { initialData: Payout[] }) {
  const [items, setItems] = useState<Payout[]>(initialData);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Payout | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    referralId: "",
    amount: "0",
    status: "PENDING" as Payout["status"],
    payoutDate: "",
  });
  const [q, setQ] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const [statusFilter, setStatusFilter] = useState<Payout["status"] | "">("");
  
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

  const resetForm = () => {
    setForm({ referralId: "", amount: "0", status: "PENDING", payoutDate: "" });
    setEditing(null);
  };

  const openCreate = () => {
    resetForm();
    setOpen(true);
  };

  // Debounced server-side search + filters
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
          const url = params.toString() ? `/api/admin/payouts?${params.toString()}` : "/api/admin/payouts";
          const res = await fetch(url, { signal: controller.signal });
          const raw: unknown = await res.json();
          const json = raw as { data: Payout[]; error?: unknown };
          if (!res.ok) throw new Error(json.error ? fmtError(json.error) : "Failed to load payouts");
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
  const openEdit = (p: Payout) => {
    setEditing(p);
    setForm({
      referralId: p.referralId,
      amount: String(p.amount),
      status: p.status,
      payoutDate: p.payoutDate ? String(p.payoutDate) : "",
    });
    setOpen(true);
  };

  async function onSubmit() {
    setLoading(true);
    try {
      if (editing) {
        const res = await fetch(`/api/admin/payouts/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: Number(form.amount),
            status: form.status,
            payoutDate: form.payoutDate || undefined,
          }),
        });
        const raw: unknown = await res.json();
        const json = raw as { data: Payout; error?: unknown };
        if (!res.ok) throw new Error(json.error ? fmtError(json.error) : "Failed to update payout");
        setItems((prev) => prev.map((p) => (p.id === editing.id ? json.data : p)));
        toast.success("Payout updated successfully");
      } else {
        const res = await fetch(`/api/admin/payouts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            referralId: form.referralId,
            amount: Number(form.amount),
            status: form.status,
            payoutDate: form.payoutDate || undefined,
          }),
        });
        const raw: unknown = await res.json();
        const json = raw as { data: Payout; error?: unknown };
        if (!res.ok) throw new Error(json.error ? fmtError(json.error) : "Failed to create payout");
        setItems((prev) => [json.data, ...prev]);
        toast.success("Payout created successfully");
      }
      setOpen(false);
      resetForm();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this payout?")) return;
    try {
      const res = await fetch(`/api/admin/payouts/${id}`, { method: "DELETE" });
      const raw: unknown = await res.json();
      const json = raw as { error?: unknown };
      if (!res.ok) throw new Error(json.error ? fmtError(json.error) : "Failed to delete payout");
      setItems((prev) => prev.filter((x) => x.id !== id));
      toast.success("Payout deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : String(err));
    }
  }

  async function onMarkAsPaid(id: string) {
    if (!confirm("Mark this payout as PAID?\nThis will also mark related commissions as PAID.")) return;
    try {
      const res = await fetch(`/api/admin/payouts/${id}/mark-paid`, { method: "PATCH" });
      const raw: unknown = await res.json();
      const json = raw as { data: Payout; error?: unknown };
      if (!res.ok) throw new Error(json.error ? fmtError(json.error) : "Failed to mark payout as PAID");
      // Update the local state with the updated payout
      setItems((prev) => prev.map((p) => (p.id === id ? json.data : p)));
      toast.success("Payout marked as PAID");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : String(err));
    }
  }

  // Items are already filtered server-side via q

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Payouts</h1>
        <div className="flex-1" />
        <Input
          placeholder="Search by referral code or status..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-xs"
        />
        <select
          className="border rounded px-2 py-1"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as Payout["status"] | "")}
        >
          <option value="">All Statuses</option>
          {(["PENDING","PAID","FAILED","UNPAID"] as const).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <Button variant="outline" onClick={() => downloadCsv("/api/admin/payouts/export", "payouts.csv")}>Export CSV</Button>
        <Button onClick={openCreate}>Add Payout</Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <THead>
            <TR>
              <TH>Referral Code</TH>
              <TH>Amount</TH>
              <TH>Status</TH>
              <TH>Payout Date</TH>
              <TH>Created</TH>
              <TH className="text-right">Actions</TH>
            </TR>
          </THead>
          <TBody>
            {items.map((p) => (
              <TR key={p.id}>
                <TD>{p.referralCode}</TD>
                <TD>${(p.amount / 100).toFixed(2)}</TD>
                <TD>{p.status}</TD>
                <TD>{p.payoutDate ? new Date(p.payoutDate).toLocaleDateString() : "—"}</TD>
                <TD>{new Date(p.createdAt).toLocaleString()}</TD>
                <TD className="text-right space-x-2">
                  {p.status !== "PAID" && (
                    <Button variant="outline" size="sm" onClick={() => onMarkAsPaid(p.id)}>
                      Mark as Paid
                    </Button>
                  )}
                  <Button variant="secondary" size="sm" onClick={() => openEdit(p)}>
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(p.id)}>
                    Delete
                  </Button>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </div>

      <Modal open={open} onClose={() => { setOpen(false); resetForm(); }} title={editing ? "Edit Payout" : "Add Payout"}>
        <div className="grid gap-3">
          <label className="grid gap-1">
            <span className="text-sm">Referral ID</span>
            <Input value={form.referralId} onChange={(e) => setForm((f) => ({ ...f, referralId: e.target.value }))} disabled={!!editing} />
          </label>
          <label className="grid gap-1">
            <span className="text-sm">Amount (cents)</span>
            <Input type="number" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />
          </label>
          <label className="grid gap-1">
            <span className="text-sm">Status (PENDING | PAID | FAILED | UNPAID)</span>
            <Input value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Payout["status"] }))} />
          </label>
          <label className="grid gap-1">
            <span className="text-sm">Payout Date (ISO)</span>
            <Input value={form.payoutDate} onChange={(e) => setForm((f) => ({ ...f, payoutDate: e.target.value }))} />
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => { setOpen(false); resetForm(); }} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={onSubmit} disabled={loading}>
              {editing ? "Save" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  );
}