"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Table, TBody, TD, TH, THead, TR } from "~/components/ui/table";
import Link from "next/link";

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
      alert(fmtError(err));
    } finally {
      setSavingId(null);
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Orders</h1>
      </div>

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
    </section>
  );
}
