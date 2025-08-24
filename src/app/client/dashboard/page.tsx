export const dynamic = "force-static";

export default function ClientDashboardPage() {
  return (
    <main className="min-h-[60vh] mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Client Dashboard</h1>
      <p className="mt-3 text-muted-foreground">
        This dashboard is rendered without the global Navbar and Footer.
      </p>
      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border p-6">
          <h2 className="font-semibold">Overview</h2>
          <p className="mt-2 text-sm text-muted-foreground">Your quick stats and activity.</p>
        </div>
        <div className="rounded-lg border p-6">
          <h2 className="font-semibold">Recent</h2>
          <p className="mt-2 text-sm text-muted-foreground">Latest updates and items.</p>
        </div>
        <div className="rounded-lg border p-6">
          <h2 className="font-semibold">Shortcuts</h2>
          <p className="mt-2 text-sm text-muted-foreground">Fast access to common tasks.</p>
        </div>
      </section>
    </main>
  );
}
