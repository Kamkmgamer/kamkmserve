"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Mail,
  MessageSquare,
  User,
  Loader2,
  CheckCircle2,
  Phone,
  Clock,
  MapPin,
  ShieldCheck,
  Send,
} from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) throw new Error("Failed to send message");

      setStatus("success");
      toast.success("Message sent! We'll get back within 1 business day.");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      setStatus("error");
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
    }
  }

  return (
    <main className="relative">
      {/* Backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-blue-500/5 via-transparent to-purple-500/5" />

      <section className="container mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Left: Info */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-300">
              <ShieldCheck className="size-4" />
              We reply within 1 business day
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
              Contact our team
            </h1>
            <p className="mt-3 text-balance text-slate-600 dark:text-slate-400">
              Questions, feedback, or need a hand? Send us a message and we’ll respond quickly.
            </p>

            {/* Quick contact cards */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200/50 bg-white/70 p-4 backdrop-blur-sm dark:border-slate-800/50 dark:bg-slate-900/40">
                <div className="flex items-center gap-3">
                  <Mail className="size-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">support@kamkmserve.com</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200/50 bg-white/70 p-4 backdrop-blur-sm dark:border-slate-800/50 dark:bg-slate-900/40">
                <div className="flex items-center gap-3">
                  <Clock className="size-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Hours</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Mon–Fri, 9am–6pm</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200/50 bg-white/70 p-4 backdrop-blur-sm dark:border-slate-800/50 dark:bg-slate-900/40">
                <div className="flex items-center gap-3">
                  <MapPin className="size-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Global • Remote-first</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200/50 bg-white/70 p-4 backdrop-blur-sm dark:border-slate-800/50 dark:bg-slate-900/40">
                <div className="flex items-center gap-3">
                  <Phone className="size-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Upon request</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social proof bullets */}
            <ul className="mt-8 space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-green-600" />Dedicated support engineers</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-green-600" />SLA for paid plans</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-green-600" />Secure & GDPR-friendly</li>
            </ul>
          </div>

          {/* Right: Form */}
          <div>
            <div className="rounded-2xl bg-gradient-to-br from-blue-600/20 via-transparent to-purple-600/20 p-[1px]">
              <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-lg backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-900/70">
                <form onSubmit={onSubmit} className="space-y-5" aria-live="polite">
                  <div>
                    <label className="block text-sm font-medium">Name</label>
                    <div className="relative mt-1">
                      <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="Your full name"
                        className="w-full rounded-md border border-slate-300/80 bg-white/70 px-10 py-2 text-slate-900 outline-none ring-blue-500/20 placeholder:text-slate-400 focus:ring-2 dark:border-slate-700/80 dark:bg-slate-950/40 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium">Email</label>
                    <div className="relative mt-1">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                      <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        required
                        placeholder="you@example.com"
                        className="w-full rounded-md border border-slate-300/80 bg-white/70 px-10 py-2 text-slate-900 outline-none ring-blue-500/20 placeholder:text-slate-400 focus:ring-2 dark:border-slate-700/80 dark:bg-slate-950/40 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium">Message</label>
                    <div className="relative mt-1">
                      <MessageSquare className="pointer-events-none absolute left-3 top-3 size-4 text-slate-400" />
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        rows={6}
                        placeholder="How can we help?"
                        className="w-full resize-y rounded-md border border-slate-300/80 bg-white/70 px-10 py-2 text-slate-900 outline-none ring-blue-500/20 placeholder:text-slate-400 focus:ring-2 dark:border-slate-700/80 dark:bg-slate-950/40 dark:text-slate-100"
                      />
                      <div className="mt-1 text-right text-xs text-slate-500">{message.length}/1000</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500">This site is protected by best practices and modern security.</p>
                  </div>

                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                  >
                    {status === "submitting" ? (
                      <>
                        <Loader2 className="size-4 animate-spin" /> Sending
                      </>
                    ) : (
                      <>
                        <Send className="size-4" /> Send message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
