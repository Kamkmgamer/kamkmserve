import { db } from "~/server/db";
import { services } from "~/server/db/schema";
import { desc } from "drizzle-orm";
import ServicesClient from "./services-client";
import type { ComponentProps } from "react";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  const rows = await db.select().from(services).orderBy(desc(services.createdAt));
  type InitialData = ComponentProps<typeof ServicesClient>["initialData"];
  const clientRows: InitialData = rows.map((r) => ({
    ...r,
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : (r.createdAt as unknown as string),
  }));
  return <ServicesClient initialData={clientRows} />;
}
