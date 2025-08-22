"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Table, TBody, TD, TH, THead, TR } from "~/components/ui/table";
import { Modal } from "~/components/ui/modal";
import { Input } from "~/components/ui/input";

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
      alert(fmtError(err));
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
      alert(fmtError(err));
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Blogs</h1>
        <Button onClick={openCreate}>New Post</Button>
      </div>

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
