import { db } from "~/server/db";
import { services as servicesTable } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { unstable_cache as cache } from "next/cache";

export type Service = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  features: string; // JSON string
  imageUrls: string; // JSON string
  thumbnailUrl: string | null;
};

export const getAllServices = cache(
  async (): Promise<Service[]> => {
    const rows = await db.select().from(servicesTable);
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      category: r.category,
      price: Number(r.price),
      features: r.features,
      imageUrls: r.imageUrls,
      thumbnailUrl: r.thumbnailUrl ?? null,
    }));
  },
  ["services:all"],
  { revalidate: 300, tags: ["services"] }
);

export const getServiceById = async (id: string): Promise<Service | null> =>
  cache(
    async (): Promise<Service | null> => {
      const rows = await db
        .select()
        .from(servicesTable)
        .where(eq(servicesTable.id, id))
        .limit(1);
      const r = rows[0];
      if (!r) return null;
      return {
        id: r.id,
        name: r.name,
        description: r.description,
        category: r.category,
        price: Number(r.price),
        features: r.features,
        imageUrls: r.imageUrls,
        thumbnailUrl: r.thumbnailUrl ?? null,
      };
    },
    ["services:by-id", id],
    { revalidate: 300, tags: ["services", `service:${id}`] }
  )();
