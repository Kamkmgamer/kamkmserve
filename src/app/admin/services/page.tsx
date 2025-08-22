import { db } from "~/server/db";
import { services } from "~/server/db/schema";
import { desc } from "drizzle-orm";
import ServicesClient from "./services-client";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  const rows = await db.select().from(services).orderBy(desc(services.createdAt));
  const clientRows = rows.map((r) => ({
    ...r,
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : (r.createdAt as unknown as string),
  }));
  return <ServicesClient initialData={clientRows as any} />;
}
