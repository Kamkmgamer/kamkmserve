export const dynamic = "force-static";

export default function ClientHomePage() {
  return (
    <main className="min-h-[60vh] mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Client Area</h1>
      <p className="mt-3 text-muted-foreground">
        This page is rendered without the global Navbar and Footer.
      </p>
      <div className="mt-8 rounded-lg border p-6">
        <p className="text-sm text-muted-foreground">
          Add your client-only content here. Pages under /client/* will not include the public chrome.
        </p>
      </div>
    </main>
  );
}
