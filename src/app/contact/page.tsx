"use client";

import { useState } from "react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) throw new Error("Failed to send message");
      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <main className="container mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-bold">Contact</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">We usually reply within 1 business day.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium">Message</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} required rows={6} className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <button type="submit" disabled={status === "submitting"} className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60">
          {status === "submitting" ? "Sending..." : "Send message"}
        </button>
        {status === "success" && <p className="text-green-600">Thanks! Your message has been sent.</p>}
        {status === "error" && <p className="text-red-600">{error}</p>}
      </form>
    </main>
  );
}
