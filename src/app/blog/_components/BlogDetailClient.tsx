"use client";

import React from "react";
import Link from "next/link";
import Container from "~/components/layout/Container";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Share2, Copy } from "lucide-react";
import type { BlogPost } from "~/server/blogs";
import { toast } from "sonner";

export type BlogWithSlug = BlogPost & { slug: string };

export default function BlogDetailClient({ post }: { post: BlogWithSlug }) {
  const [copied, setCopied] = React.useState(false);
  const [canShare, setCanShare] = React.useState(false);

  React.useEffect(() => {
    if (typeof navigator === "undefined") return;
    const nav = navigator as Navigator & { share?: (data: ShareData) => Promise<void> };
    setCanShare(typeof nav.share === "function");
  }, []);

  const handleShare = React.useCallback(async () => {
    const url = window.location.href;
    if (canShare) {
      try {
        const nav = navigator as Navigator & { share?: (data: ShareData) => Promise<void> };
        await nav.share?.({ title: post.title, text: post.summary?.slice(0, 100), url });
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
  }, [post.title, post.summary, canShare]);

  const date = new Date(post.createdAt).toLocaleDateString();

  return (
    <div className="bg-slate-50 dark:bg-slate-950">
      <div className="bg-gradient-to-b from-blue-50/70 to-transparent py-6 dark:from-slate-900/40">
        <Container className="px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <Link href="/blog" className="text-blue-600 hover:underline dark:text-blue-400">
            &larr; Back to Blog
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-700">
            <CalendarDays className="h-4 w-4" />
            {date}
          </div>
        </Container>
      </div>

      <Container className="px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <motion.div
          className={`grid grid-cols-1 gap-10 ${post.thumbnailUrl ? "md:grid-cols-2" : "md:grid-cols-1"}`}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          {post.thumbnailUrl && (
            <div className="relative">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={post.thumbnailUrl} alt={post.title} className="w-full object-cover" />
              </div>
            </div>
          )}

          <div className="flex flex-col">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl md:text-4xl">{post.title}</h1>
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

            {post.summary && (
              <p className="mb-6 text-base sm:text-lg text-slate-600 dark:text-slate-300">{post.summary}</p>
            )}

            <article className="prose dark:prose-invert max-w-none">
              <pre className="whitespace-pre-wrap break-words">{post.content}</pre>
            </article>
          </div>
        </motion.div>

        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.45 }}
            className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          >
            Enjoyed this article? Share your thoughts or ask a question.
            <Link href="/contact" className="text-blue-600 hover:underline"> Get in touch &rarr;</Link>
          </motion.div>
        </AnimatePresence>
      </Container>
    </div>
  );
}
