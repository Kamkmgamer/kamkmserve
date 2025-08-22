"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Table, TBody, TD, TH, THead, TR } from "~/components/ui/table";
import { Modal } from "~/components/ui/modal";
import { Input } from "~/components/ui/input";
import toast from "react-hot-toast";

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
  const [search, setSearch] = useState("");

  const resetForm = () => {
    setForm({ referralId: "", amount: "0", status: "PENDING", payoutDate: "" });
    setEditing(null);
  };

  const openCreate = () => {
    resetForm();
    setOpen(true);
  };
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
        if (!res.ok) throw new Error(json.error ? String(json.error) : "Failed to update payout");
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
        if (!res.ok) throw new Error(json.error ? String(json.error) : "Failed to create payout");
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
      if (!res.ok) throw new Error(json.error ? String(json.error) : "Failed to delete payout");
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
      if (!res.ok) throw new Error(json.error ? String(json.error) : "Failed to mark payout as PAID");
      // Update the local state with the updated payout
      setItems((prev) => prev.map((p) => (p.id === id ? json.data : p)));
      toast.success("Payout marked as PAID");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : String(err));
    }
  }

  // Filter items based on search; case insensitive search on referralCode
  const filteredItems = items.filter((p) =>
    p.referralCode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Payouts</h1>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Search by referral code"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-2 py-1 border rounded"
          />
          <Button onClick={openCreate}>Add Payout</Button>
        </div>
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
            {filteredItems.map((p) => (
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