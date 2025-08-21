import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/protected");
  }

  const user = await currentUser();

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Protected Area</h1>
      <p className="mt-2 text-sm text-muted">
        Only signed-in users can view this page.
      </p>

      <div className="mt-6 rounded-2xl border border-token bg-surface p-6 shadow-card">
        <div className="text-sm">Welcome,</div>
        <div className="mt-1 text-lg font-medium">{user?.firstName ?? "User"}</div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <a
            href="/"
            className="rounded-xl border border-token bg-white/60 px-4 py-3 text-sm transition hover:shadow-card dark:bg-white/5"
          >
            ← Back to Home
          </a>
          <a
            href="/api/protected"
            className="rounded-xl border border-token bg-white/60 px-4 py-3 text-sm transition hover:shadow-card dark:bg-white/5"
          >
            Call protected API
          </a>
        </div>
      </div>
    </main>
  );
}
