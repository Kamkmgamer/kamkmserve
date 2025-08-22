"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Table, TBody, TD, TH, THead, TR } from "~/components/ui/table";
import { Modal } from "~/components/ui/modal";
import { Input } from "~/components/ui/input";

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
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Failed to update");
        setServices((prev) => prev.map((p) => (p.id === editing.id ? json.data : p)));
      } else {
        const res = await fetch("/api/admin/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Failed to create");
        setServices((prev) => [json.data, ...prev]);
      }
      setOpen(false);
      resetForm();
    } catch (err) {
      console.error(err);
      alert((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this service?")) return;
    try {
      const res = await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to delete");
      setServices((prev) => prev.filter((x) => x.id !== id));
    } catch (err) {
      console.error(err);
      alert((err as Error).message);
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Services</h1>
        <Button onClick={openCreate}>Add Service</Button>
      </div>

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
