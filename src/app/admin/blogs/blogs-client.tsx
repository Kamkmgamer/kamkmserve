"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { Table, TBody, TD, TH, THead, TR } from "~/components/ui/table";
import { Modal } from "~/components/ui/modal";
import { Input } from "~/components/ui/input";
import { toast } from "sonner";
import { LayoutGrid, List as ListIcon } from "lucide-react";

export type Blog = {
  id: string;
  title: string;
  summary: string;
  content: string;
  thumbnailUrl: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  userId: string;
  author: string;
};

export default function BlogsClient({ initialData }: { initialData: Blog[] }) {
  const [posts, setPosts] = useState<Blog[]>(initialData);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  // list vs cards view (cards enforced on small screens via CSS)
  const [view, setView] = useState<"list" | "cards">(() => {
    if (typeof window === "undefined") return "list";
    return (window.localStorage.getItem("admin_blogs_view") as "list" | "cards") || "list";
  });
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("admin_blogs_view", view);
    }
  }, [view]);
  const abortRef = useRef<AbortController | null>(null);
  const [form, setForm] = useState({
    title: "",
    summary: "",
    content: "",
    thumbnailUrl: "",
  });

  const resetForm = () => {
    setForm({ title: "", summary: "", content: "", thumbnailUrl: "" });
    setEditing(null);
  };

  const openCreate = () => {
    resetForm();
    setOpen(true);
  };

  const openEdit = (p: Blog) => {
    setEditing(p);
    setForm({
      title: p.title,
      summary: p.summary,
      content: p.content,
      thumbnailUrl: p.thumbnailUrl ?? "",
    });
    setOpen(true);
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

  // Fetch with search (debounced)
  useEffect(() => {
    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;
    const t = setTimeout(() => {
      void (async () => {
        try {
          const url = q ? `/api/admin/blogs?q=${encodeURIComponent(q)}` : "/api/admin/blogs";
          const res = await fetch(url, { signal: controller.signal });
          const raw: unknown = await res.json();
          const json = raw as { data: Blog[]; error?: unknown };
          if (!res.ok) throw new Error(typeof json.error === "string" ? json.error : "Failed to load posts");
          setPosts(json.data);
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
  

  async function onSubmit() {
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        summary: form.summary,
        content: form.content,
        thumbnailUrl: form.thumbnailUrl || undefined,
      };
      if (editing) {
        const res = await fetch(`/api/admin/blogs/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const raw: unknown = await res.json();
        const json = raw as { data: Blog; error?: unknown };
        if (!res.ok) throw new Error(fmtError(json.error) || "Failed to update post");
        setPosts((prev) => prev.map((p) => (p.id === editing.id ? json.data : p)));
      } else {
        const res = await fetch(`/api/admin/blogs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const raw: unknown = await res.json();
        const json = raw as { data: Blog; error?: unknown };
        if (!res.ok) throw new Error(fmtError(json.error) || "Failed to create post");
        setPosts((prev) => [json.data, ...prev]);
      }
      setOpen(false);
      resetForm();
    } catch (err) {
      console.error(err);
      toast.error(fmtError(err));
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this post?")) return;
    try {
      const res = await fetch(`/api/admin/blogs/${id}`, { method: "DELETE" });
      const raw: unknown = await res.json();
      const json = raw as { error?: unknown };
      if (!res.ok) throw new Error(fmtError(json.error) || "Failed to delete post");
      setPosts((prev) => prev.filter((x) => x.id !== id));
    } catch (err) {
      console.error(err);
      toast.error(fmtError(err));
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Blogs</h1>
        <div className="flex-1" />
        {/* View toggle (effective on md+; small screens always show cards) */}
        <div className="hidden items-center gap-1 md:flex" role="group" aria-label="View mode">
          <Button
            variant={view === "list" ? "primary" : "ghost"}
            size="sm"
            aria-pressed={view === "list"}
            onClick={() => setView("list")}
            title="List view"
          >
            <ListIcon className="h-4 w-4" />
          </Button>
          <Button
            variant={view === "cards" ? "primary" : "ghost"}
            size="sm"
            aria-pressed={view === "cards"}
            onClick={() => setView("cards")}
            title="Card view"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
        <Input
          placeholder="Search title, summary, content, or author..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-xs"
        />
        <Button onClick={openCreate}>New Post</Button>
      </div>

      {/* Table (desktop list view only) */}
      <div className={view === "list" ? "hidden md:block" : "hidden"}>
        <div className="overflow-x-auto">
          <Table>
            <THead>
              <TR>
                <TH>Title</TH>
                <TH>Summary</TH>
                <TH>Author</TH>
                <TH>Created</TH>
                <TH className="text-right">Actions</TH>
              </TR>
            </THead>
            <TBody>
              {posts.map((p) => (
                <TR key={p.id}>
                  <TD>{p.title}</TD>
                  <TD className="max-w-[420px] truncate">{p.summary}</TD>
                  <TD>{p.author}</TD>
                  <TD>{new Date(p.createdAt).toLocaleString()}</TD>
                  <TD className="text-right space-x-2">
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
      </div>

      {/* Cards (always visible on small; on md+ only when cards selected) */}
      <div className={view === "list" ? "grid grid-cols-1 gap-4 md:hidden sm:grid-cols-2" : "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"}>
        {posts.map((p) => (
          <div key={p.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">{p.title}</h3>
                <p className="text-xs text-slate-500">by {p.author}</p>
              </div>
              <div className="text-right text-xs text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</div>
            </div>
            {p.thumbnailUrl ? (
              <div className="mt-3 overflow-hidden rounded-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.thumbnailUrl} alt={p.title} className="h-36 w-full object-cover" />
              </div>
            ) : null}
            <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{p.summary}</p>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <span>Updated {new Date(p.updatedAt).toLocaleDateString()}</span>
              <div className="space-x-2">
                <Button variant="secondary" size="sm" onClick={() => openEdit(p)}>Edit</Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(p.id)}>Delete</Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          resetForm();
        }}
        title={editing ? "Edit Post" : "New Post"}
      >
        <div className="grid gap-3">
          <label className="grid gap-1">
            <span className="text-sm">Title</span>
            <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </label>
          <label className="grid gap-1">
            <span className="text-sm">Summary</span>
            <Input value={form.summary} onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))} />
          </label>
          <label className="grid gap-1">
            <span className="text-sm">Thumbnail URL</span>
            <Input value={form.thumbnailUrl} onChange={(e) => setForm((f) => ({ ...f, thumbnailUrl: e.target.value }))} />
          </label>
          <label className="grid gap-1">
            <span className="text-sm">Content</span>
            <textarea
              className="min-h-[160px] rounded-md border border-slate-200 p-2 text-sm outline-none dark:border-slate-800"
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            />
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
