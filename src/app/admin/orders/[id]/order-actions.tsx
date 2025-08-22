"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";

export default function OrderActions({ id, initialStatus }: { id: string; initialStatus: string }) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState<string | null>(null);

  async function updateStatus(next: string) {
    setLoading(next);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const json = (await res.json()) as { data?: { status?: string }; error?: unknown };
      if (!res.ok) throw new Error(typeof json.error === "string" ? json.error : "Failed to update");
      if (json.data?.status) setStatus(json.data.status);
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex gap-2">
      <Button onClick={() => updateStatus("REFUNDED")} disabled={loading !== null || status === "REFUNDED"}>
        {loading === "REFUNDED" ? "Refunding..." : "Refund"}
      </Button>
      <Button variant="secondary" onClick={() => updateStatus("CANCELED")} disabled={loading !== null || status === "CANCELED"}>
        {loading === "CANCELED" ? "Canceling..." : "Cancel Order"}
      </Button>
    </div>
  );
}
