"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Button from "~/components/ui/button";
import LoadingSpinner from "~/components/ui/loading-spinner";
import { toast } from "sonner";

type CartItem = {
  id: string;
  serviceId: string;
  name: string;
  price: number; // unit price
  quantity: number;
  subtotal: number;
  thumbnailUrl: string | null;
  imageUrls: string;
  category: string;
  description: string;
};

type CartData = {
  items: CartItem[];
  totals: { subtotal: number; tax: number; total: number };
};

const formatUSD = (n: number) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n);

export default function CartClient() {
  const [data, setData] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [checkingOut, setCheckingOut] = useState(false);
  const router = useRouter();

  const getErrorMessage = useCallback((body: unknown, fallback: string): string => {
    if (typeof body === "object" && body !== null && "error" in body) {
      const err = (body as { error?: unknown }).error;
      if (typeof err === "string") return err;
    }
    return fallback;
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/cart", { cache: "no-store" });
      const body: unknown = await res.json();
      if (!res.ok) throw new Error(getErrorMessage(body, "Failed to load cart"));
      const obj = body as { data?: unknown };
      if (!obj.data || typeof obj.data !== "object") throw new Error("Invalid response");
      setData(obj.data as CartData);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Failed to load cart");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (!data) return;
    if (quantity < 1) quantity = 1;
    const prev = data;
    const optimistic: CartData = {
      ...data,
      items: data.items.map((it) => (it.id === itemId ? { ...it, quantity, subtotal: it.price * quantity } : it)),
    };
    optimistic.totals = {
      subtotal: optimistic.items.reduce((acc, it) => acc + it.subtotal, 0),
      tax: 0,
      total: optimistic.items.reduce((acc, it) => acc + it.subtotal, 0),
    };
    setData(optimistic);

    startTransition(async () => {
      try {
        const res = await fetch(`/api/cart/items/${itemId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity }),
        });
        const body: unknown = await res.json();
        if (!res.ok) throw new Error(getErrorMessage(body, "Failed to update"));
        const obj = body as { data?: unknown };
        if (!obj.data || typeof obj.data !== "object") throw new Error("Invalid response");
        setData(obj.data as CartData);
      } catch (e) {
        setData(prev);
        toast.error(e instanceof Error ? e.message : "Failed to update item");
      }
    });
  }, [data]);

  const removeItem = useCallback((itemId: string) => {
    if (!data) return;
    const prev = data;
    const optimistic: CartData = {
      items: data.items.filter((it) => it.id !== itemId),
      totals: { subtotal: 0, tax: 0, total: 0 },
    };
    optimistic.totals.subtotal = optimistic.items.reduce((acc, it) => acc + it.subtotal, 0);
    optimistic.totals.total = optimistic.totals.subtotal;
    setData(optimistic);

    startTransition(async () => {
      try {
        const res = await fetch(`/api/cart/items/${itemId}`, { method: "DELETE" });
        const body: unknown = await res.json();
        if (!res.ok) throw new Error(getErrorMessage(body, "Failed to remove"));
        const obj = body as { data?: unknown };
        if (!obj.data || typeof obj.data !== "object") throw new Error("Invalid response");
        setData(obj.data as CartData);
      } catch (e) {
        setData(prev);
        toast.error(e instanceof Error ? e.message : "Failed to remove item");
      }
    });
  }, [data]);

  const isEmpty = useMemo(() => !loading && !error && (!data || data.items.length === 0), [loading, error, data]);

  const handleCheckout = useCallback(async () => {
    try {
      setCheckingOut(true);
      const res = await fetch("/api/checkout", { method: "POST" });
      const body: unknown = await res.json();
      if (!res.ok) throw new Error(getErrorMessage(body, "Checkout failed"));
      const obj = body as { data?: unknown };
      const data = obj.data as { orderId?: unknown; totalAmount?: unknown } | undefined;
      const orderId = data?.orderId;
      const totalAmount = data?.totalAmount;
      if (typeof orderId !== "string" || typeof totalAmount !== "number") throw new Error("Invalid response");
      router.push(`/checkout/success?orderId=${encodeURIComponent(orderId)}&amount=${totalAmount}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Checkout failed");
    } finally {
      setCheckingOut(false);
    }
  }, [router, getErrorMessage]);

  if (loading) return <LoadingSpinner fullscreen={false} size={56} />;
  if (error)
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-200">
        <div className="mb-3 text-lg font-semibold">Couldn’t load your cart</div>
        <div className="mb-4 text-sm opacity-90">{error}</div>
        <Button onClick={() => void load()} variant="outline">Try again</Button>
      </div>
    );
  if (isEmpty)
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">Your cart is empty</div>
        <p className="mb-6 text-slate-600 dark:text-slate-300">Browse services and add what you like to the cart.</p>
        <Button href="/services">Explore Services</Button>
      </div>
    );

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Items */}
      <div className="lg:col-span-8 space-y-4">
        {data!.items.map((it) => (
          <div key={it.id} className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="h-20 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
              {it.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={it.thumbnailUrl} alt={it.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-slate-500 dark:text-slate-400">No image</div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">{it.category}</div>
                  <div className="text-base font-semibold text-slate-900 dark:text-white">{it.name}</div>
                </div>
                <div className="text-base font-bold text-slate-900 dark:text-white">{formatUSD(it.price)}</div>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex items-center rounded-lg border border-slate-200 dark:border-slate-700">
                  <button
                    className="px-3 py-1 text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-800"
                    onClick={() => updateQuantity(it.id, it.quantity - 1)}
                    aria-label="Decrease quantity"
                    disabled={isPending || it.quantity <= 1}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={1}
                    className="w-16 border-x border-slate-200 bg-white p-1 text-center text-sm outline-none dark:border-slate-700 dark:bg-slate-900"
                    value={it.quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (Number.isNaN(val)) return;
                      updateQuantity(it.id, val);
                    }}
                  />
                  <button
                    className="px-3 py-1 text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-800"
                    onClick={() => updateQuantity(it.id, it.quantity + 1)}
                    aria-label="Increase quantity"
                    disabled={isPending}
                  >
                    +
                  </button>
                </div>

                <div className="ml-auto text-sm text-slate-600 dark:text-slate-300">
                  Subtotal: <span className="font-semibold text-slate-900 dark:text-white">{formatUSD(it.subtotal)}</span>
                </div>

                <button
                  className="text-sm text-rose-600 hover:underline disabled:opacity-50 dark:text-rose-400"
                  onClick={() => removeItem(it.id)}
                  disabled={isPending}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="lg:col-span-4">
        <div className="sticky top-24 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Order Summary</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>Subtotal</span>
              <span className="font-medium text-slate-900 dark:text-white">{formatUSD(data!.totals.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>Taxes & fees</span>
              <span className="font-medium text-slate-900 dark:text-white">{formatUSD(data!.totals.tax)}</span>
            </div>
            <div className="mt-3 flex justify-between border-t border-slate-200 pt-3 text-slate-900 dark:border-slate-800 dark:text-white">
              <span className="font-semibold">Total</span>
              <span className="text-base font-extrabold">{formatUSD(data!.totals.total)}</span>
            </div>
          </div>
          <div className="mt-5">
            <Button className="w-full" onClick={handleCheckout} disabled={checkingOut || isPending || !data || data.items.length === 0}>
              {checkingOut ? "Processing..." : "Proceed to checkout"}
            </Button>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Secure checkout. No hidden fees.</p>
        </div>
      </div>
    </div>
  );
}
