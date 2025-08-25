"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { Table, TBody, TD, TH, THead, TR } from "~/components/ui/table";
import { Modal } from "~/components/ui/modal";
import { Input } from "~/components/ui/input";
import { toast } from "sonner";
import { LayoutGrid, List as ListIcon } from "lucide-react";

type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string;
  category: string;
  thumbnailUrl: string | null;
  imageUrls: string;
  createdAt: string | Date;
};

export default function ServicesClient({ initialData }: { initialData: Service[] }) {
  const [services, setServices] = useState<Service[]>(initialData);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [q, setQ] = useState("");
  // list vs cards view (cards enforced on small screens via CSS)
  const [view, setView] = useState<"list" | "cards">(() => {
    if (typeof window === "undefined") return "list";
    return (window.localStorage.getItem("admin_services_view") as "list" | "cards") || "list";
  });
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("admin_services_view", view);
    }
  }, [view]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    features: "",
    category: "",
    thumbnailUrl: "",
    imageUrls: "",
  });
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

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

  // Fetch with search
  useEffect(() => {
    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;
    const t = setTimeout(() => {
      void (async () => {
        try {
          const url = q ? `/api/admin/services?q=${encodeURIComponent(q)}` : "/api/admin/services";
          const res = await fetch(url, { signal: controller.signal });
          const raw: unknown = await res.json();
          const json = raw as { data: Service[]; error?: unknown };
          if (!res.ok) throw new Error(fmtError(json.error) || "Failed to load services");
          setServices(json.data);
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

  const resetForm = () => {
    setForm({ name: "", description: "", price: "", features: "", category: "", thumbnailUrl: "", imageUrls: "" });
    setEditing(null);
  };

  const openCreate = () => {
    resetForm();
    setOpen(true);
  };

  const openEdit = (s: Service) => {
    setEditing(s);
    setForm({
      name: s.name,
      description: s.description,
      price: String(s.price),
      features: s.features,
      category: s.category,
      thumbnailUrl: s.thumbnailUrl ?? "",
      imageUrls: s.imageUrls,
    });
    setOpen(true);
  };

  async function onSubmit() {
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        features: form.features,
        category: form.category,
        thumbnailUrl: form.thumbnailUrl || undefined,
        imageUrls: form.imageUrls,
      };
      if (editing) {
        const res = await fetch(`/api/admin/services/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const rawUpdate: unknown = await res.json();
        const json = rawUpdate as { data: Service; error?: unknown };
        if (!res.ok) throw new Error(fmtError(json.error) || "Failed to update");
        setServices((prev) => prev.map((p) => (p.id === editing.id ? json.data : p)));
        toast.success("Service updated");
      } else {
        const res = await fetch("/api/admin/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const rawCreate: unknown = await res.json();
        const json = rawCreate as { data: Service; error?: unknown };
        if (!res.ok) throw new Error(fmtError(json.error) || "Failed to create");
        setServices((prev) => [json.data, ...prev]);
        toast.success("Service created");
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
    if (!confirm("Delete this service?")) return;
    try {
      const res = await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
      const rawDelete: unknown = await res.json();
      const json = rawDelete as { error?: unknown };
      if (!res.ok) throw new Error(fmtError(json.error) || "Failed to delete");
      setServices((prev) => prev.filter((x) => x.id !== id));
    } catch (err) {
      console.error(err);
      toast.error(fmtError(err));
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Services</h1>
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
          placeholder="Search name, category, description..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-xs"
        />
        <Button onClick={openCreate}>Add Service</Button>
      </div>

      {/* Table (desktop list view only) */}
      <div className={view === "list" ? "hidden md:block" : "hidden"}>
        <div className="overflow-x-auto">
          <Table>
            <THead>
              <TR>
                <TH>Name</TH>
                <TH>Category</TH>
                <TH>Price</TH>
                <TH>Created</TH>
                <TH className="text-right">Actions</TH>
              </TR>
            </THead>
            <TBody>
              {services.map((s) => (
                <TR key={s.id}>
                  <TD>{s.name}</TD>
                  <TD>{s.category}</TD>
                  <TD>${s.price.toFixed(2)}</TD>
                  <TD>{new Date(s.createdAt).toLocaleString()}</TD>
                  <TD className="text-right space-x-2">
                    <Button variant="secondary" size="sm" onClick={() => openEdit(s)}>Edit</Button>
                    <Button variant="ghost" size="sm" onClick={() => onDelete(s.id)}>Delete</Button>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
      </div>

      {/* Cards (always visible on small; on md+ only when cards selected) */}
      <div className={view === "list" ? "grid grid-cols-1 gap-4 md:hidden sm:grid-cols-2" : "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"}>
        {services.map((s) => (
          <div key={s.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">{s.name}</h3>
                <p className="text-xs text-slate-500">{s.category}</p>
              </div>
              <div className="text-right font-semibold">${s.price.toFixed(2)}</div>
            </div>
            {s.thumbnailUrl ? (
              <div className="mt-3 overflow-hidden rounded-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.thumbnailUrl} alt={s.name} className="h-36 w-full object-cover" />
              </div>
            ) : null}
            <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{s.description}</p>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <span>Created {new Date(s.createdAt).toLocaleDateString()}</span>
              <div className="space-x-2">
                <Button variant="secondary" size="sm" onClick={() => openEdit(s)}>Edit</Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(s.id)}>Delete</Button>
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
        title={editing ? "Edit Service" : "Add Service"}
      >
        <div className="grid gap-3">
          <label className="grid gap-1">
            <span className="text-sm">Name</span>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </label>
          <label className="grid gap-1">
            <span className="text-sm">Description</span>
            <Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </label>
          <label className="grid gap-1">
            <span className="text-sm">Price</span>
            <Input type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
          </label>
          <label className="grid gap-1">
            <span className="text-sm">Features</span>
            <Input value={form.features} onChange={(e) => setForm((f) => ({ ...f, features: e.target.value }))} />
          </label>
          <label className="grid gap-1">
            <span className="text-sm">Category</span>
            <Input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
          </label>
          <label className="grid gap-1">
            <span className="text-sm">Thumbnail URL</span>
            <Input value={form.thumbnailUrl} onChange={(e) => setForm((f) => ({ ...f, thumbnailUrl: e.target.value }))} />
          </label>
          <label className="grid gap-1">
            <span className="text-sm">Image URLs (comma-separated or JSON)</span>
            <Input value={form.imageUrls} onChange={(e) => setForm((f) => ({ ...f, imageUrls: e.target.value }))} />
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
