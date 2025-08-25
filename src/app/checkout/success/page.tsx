"use client";

import Link from "next/link";
import Container from "~/components/layout/Container";
import Button from "~/components/ui/button";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

export default function CheckoutSuccessPage() {
  const params = useSearchParams();
  const orderId = params.get("orderId") ?? "";
  const amount = params.get("amount");

  const formattedAmount = useMemo(() => {
    const cents = Number(amount ?? "0");
    if (Number.isNaN(cents)) return "$0.00";
    return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(cents / 100);
  }, [amount]);

  return (
    <div className="bg-slate-50 dark:bg-slate-950 py-10">
      <Container>
        <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">✓</div>
          <h1 className="mb-2 text-2xl font-extrabold text-slate-900 dark:text-white">Order placed successfully</h1>
          <p className="mb-6 text-slate-600 dark:text-slate-300">Thank you for your purchase! We’ve received your order.</p>
          <div className="mb-6 inline-flex flex-col items-center gap-1 rounded-lg border border-slate-200 px-4 py-3 text-sm dark:border-slate-800">
            <div className="text-slate-500 dark:text-slate-400">Order ID</div>
            <div className="font-mono text-slate-900 dark:text-white">{orderId || "—"}</div>
            <div className="mt-2 text-slate-500 dark:text-slate-400">Total paid</div>
            <div className="font-semibold text-slate-900 dark:text-white">{formattedAmount}</div>
          </div>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href="/services">Continue shopping</Button>
            <Link href="/contact" className="text-blue-700 hover:underline dark:text-blue-300">Need help? Contact us</Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
