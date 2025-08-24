export const dynamic = "force-static";

export default function ClientSettingsPage() {
  return (
    <main className="min-h-[60vh] mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Client Settings</h1>
      <p className="mt-3 text-muted-foreground">
        This settings page is rendered without the global Navbar and Footer.
      </p>

      <div className="mt-8 space-y-6">
        <section className="rounded-lg border p-6">
          <h2 className="font-semibold">Profile</h2>
          <p className="mt-2 text-sm text-muted-foreground">Manage your profile information.</p>
        </section>
        <section className="rounded-lg border p-6">
          <h2 className="font-semibold">Preferences</h2>
          <p className="mt-2 text-sm text-muted-foreground">Update your preferences and notifications.</p>
        </section>
      </div>
    </main>
  );
}
