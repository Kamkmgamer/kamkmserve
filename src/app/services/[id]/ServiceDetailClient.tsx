"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Container from "~/components/layout/Container";
import Button from "~/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, ShoppingCart, ChevronLeft, ChevronRight, Sparkles, Share2, Copy } from "lucide-react";
import type { Service } from "~/server/services";
import { toast } from "sonner";

const formatPrice = (n: number) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n);

const parseJsonArray = (jsonString: string): string[] => {
  try {
    const arr: unknown = JSON.parse(jsonString);
    return Array.isArray(arr) ? arr.map(String) : [];
  } catch {
    return [];
  }
};

export default function ServiceDetailClient({ service }: { service: Service }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  const images = useMemo(() => {
    const list = parseJsonArray(service.imageUrls).filter((u) => typeof u === "string" && u.trim().length > 0);
    const all = service.thumbnailUrl ? [service.thumbnailUrl, ...list] : list;
    return all.filter((u) => typeof u === "string" && u.trim().length > 0);
  }, [service.imageUrls, service.thumbnailUrl]);

  const features = useMemo(() => parseJsonArray(service.features), [service.features]);

  const prev = useCallback(() => {
    if (!images.length) return;
    setCurrentImageIndex((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);

  const next = useCallback(() => {
    if (!images.length) return;
    setCurrentImageIndex((i) => (i + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next]);

  // Detect Web Share API support on client to avoid SSR/CSR mismatch
  useEffect(() => {
    if (typeof navigator === "undefined") return;
    const nav = navigator as Navigator & { share?: (data: ShareData) => Promise<void> };
    setCanShare(typeof nav.share === "function");
  }, []);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    if (canShare) {
      try {
        const nav = navigator as Navigator & { share?: (data: ShareData) => Promise<void> };
        await nav.share?.({ title: service.name, text: service.description?.slice(0, 100), url });
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success("Link copied to clipboard");
        setTimeout(() => setCopied(false), 1500);
      } catch {
        toast.error("Failed to copy link");
      }
    }
  }, [service.name, service.description, canShare]);

  const mainImage = images[currentImageIndex];

  return (
    <div className="bg-slate-50 dark:bg-slate-950">
      <div className="bg-gradient-to-b from-blue-50/70 to-transparent py-6 dark:from-slate-900/40">
        <Container className="px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <Link href="/services" className="text-blue-600 hover:underline dark:text-blue-400">
            ← Back to Services
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm text-blue-700 ring-1 ring-blue-200 dark:bg-slate-900 dark:text-blue-200 dark:ring-slate-700">
            <Sparkles className="h-4 w-4" />
            {service.category}
          </div>
        </Container>
      </div>

      <Container className="px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <motion.div className="grid grid-cols-1 gap-10 md:grid-cols-2" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          {/* Gallery */}
          <div className="relative">
            <motion.div layoutId={`service-image-${service.id}`} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              {mainImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mainImage} alt={service.name} className="w-full object-cover" />
              ) : (
                <div className="h-64 w-full bg-slate-100 dark:bg-slate-800" />
              )}
            </motion.div>

            {images.length > 1 && (
              <>
                <button aria-label="Previous image" onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow hover:bg-white dark:bg-slate-900/90 dark:hover:bg-slate-900">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button aria-label="Next image" onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow hover:bg-white dark:bg-slate-900/90 dark:hover:bg-slate-900">
                  <ChevronRight className="h-5 w-5" />
                </button>

                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                  {images.map((url, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={[
                        "h-20 w-24 flex-shrink-0 overflow-hidden rounded-lg border",
                        idx === currentImageIndex ? "border-blue-500 ring-2 ring-blue-200" : "border-slate-200 dark:border-slate-800",
                      ].join(" ")}
                      aria-label={`Thumbnail ${idx + 1}`}
                    >
                      {url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={url} alt={`Thumbnail ${idx + 1}`} className="h-full w-full object-cover" loading="lazy" />
                      ) : (
                        <div className="h-full w-full bg-slate-100 dark:bg-slate-800" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl md:text-4xl">{service.name}</h1>
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs sm:px-3 sm:py-2 sm:text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {canShare ? (
                  <>
                    <Share2 className="h-4 w-4" />
                    Share
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    {copied ? "Copied" : "Copy link"}
                  </>
                )}
              </button>
            </div>

            <p className="mb-6 text-base sm:text-lg text-slate-600 dark:text-slate-300">{service.description}</p>

            <div className="mb-6 flex flex-wrap gap-2">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:ring-emerald-800">High performance</span>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 ring-1 ring-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-200 dark:ring-indigo-800">SEO friendly</span>
              <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 ring-1 ring-rose-200 dark:bg-rose-900/30 dark:text-rose-200 dark:ring-rose-800">Responsive</span>
            </div>

            <div className="mb-8">
              <h3 className="mb-3 text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">What’s Included</h3>
              <ul className="space-y-2">
                {features.map((f, i) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle className="mr-2 h-5 w-5 text-emerald-500" />
                    <span className="text-slate-700 dark:text-slate-200">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-auto">
              <div className="relative">
                <div className="sticky bottom-0 left-0 right-0 bg-white p-4 shadow sm:static sm:bg-transparent sm:p-0 dark:bg-slate-900 dark:sm:bg-transparent">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{formatPrice(service.price)}</span>
                    <Button className="flex items-center gap-2" onClick={() => toast.info("Cart not implemented yet")}> 
                      <ShoppingCart className="h-5 w-5" />
                      Add to Cart
                    </Button>
                  </div>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Secure checkout. No hidden fees.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="mt-12 text-center">
          <Link href="/services" className="text-blue-600 hover:underline">
            ← Back to Services
          </Link>
        </div>

        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.45 }}
            className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          >
            Looking for something tailored? I can customize features, integrate third-party APIs, or build internal tools that suit your workflow.
            <Link href="/contact" className="text-blue-600 hover:underline"> Start a conversation →</Link>
          </motion.div>
        </AnimatePresence>
      </Container>
    </div>
  );
}
