"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Container from "~/components/layout/Container";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Search, CalendarDays } from "lucide-react";
import type { BlogPost } from "~/server/blogs";
import { useNavLoading } from "~/contexts/NavLoadingContext";

export type BlogWithSlug = BlogPost & { slug: string };

function useDebouncedValue<T>(value: T, ms = 300) {
  const [v, setV] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

const listVariants: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.04,
    },
  },
};

const itemVariants: Variants = {
  initial: { opacity: 0, y: 12, scale: 0.995 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.32, ease: [0.2, 0.8, 0.2, 1] } },
  exit: { opacity: 0, y: 12, scale: 0.995, transition: { duration: 0.18, ease: [0.2, 0.8, 0.2, 1] } },
};

const PreviewImage: React.FC<{ post: BlogWithSlug }> = ({ post }) => {
  const src = post.thumbnailUrl ?? undefined;
  return (
    <div className="relative h-44 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={post.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-slate-500 dark:text-slate-400">No image</div>
      )}
    </div>
  );
};

const BlogCard: React.FC<{ post: BlogWithSlug }> = ({ post }) => {
  const { start } = useNavLoading();
  const date = new Date(post.createdAt).toLocaleDateString();
  return (
    <motion.div
      layout
      variants={itemVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
    >
      <Link
        href={`/blog/${post.slug}`}
        className="block"
        onClick={() => {
          start();
        }}
      >
        <PreviewImage post={post} />
        <div className="p-5">
          <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            <CalendarDays className="h-4 w-4" />
            {date}
          </div>
          <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-slate-900 dark:text-white">{post.title}</h3>
          <p className="line-clamp-3 text-sm text-slate-600 dark:text-slate-300">{post.summary}</p>
          <div className="mt-4 text-sm text-blue-600 group-hover:underline">Read more →</div>
        </div>
      </Link>
    </motion.div>
  );
};

export default function BlogsClient({ initialPosts }: { initialPosts: BlogWithSlug[] }) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 220);

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return initialPosts;
    return initialPosts.filter((p) => [p.title, p.summary].some((t) => t?.toLowerCase().includes(q)));
  }, [initialPosts, debouncedQuery]);

  const onClear = React.useCallback(() => setQuery(""), []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className="bg-gradient-to-b from-slate-50 to-transparent dark:from-slate-900/40">
        <Container className="py-12 md:py-16">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">Blog</h1>
            <p className="mx-auto mt-2 max-w-2xl text-slate-600 dark:text-slate-300">Articles, updates, and insights.</p>
          </div>

          <div className="mb-10 flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-96">
              <label htmlFor="blog-search" className="sr-only">
                Search blog
              </label>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="blog-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search articles..."
                className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-10 py-2 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900"
              />

              {query && (
                <button
                  onClick={onClear}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
              <p className="text-slate-600 dark:text-slate-300">No posts found. Try a different search term.</p>
            </div>
          ) : (
            <motion.div layout variants={listVariants} initial={false} animate="animate">
              <AnimatePresence mode="sync" initial={false}>
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((p) => (
                    <BlogCard key={p.id} post={p} />
                  ))}
                </div>
              </AnimatePresence>
            </motion.div>
          )}
        </Container>
      </div>
    </motion.div>
  );
}
