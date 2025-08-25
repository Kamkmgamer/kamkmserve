import type { MetadataRoute } from "next";
import { getAllServices, slugifyServiceName } from "~/server/services";
import { getAllBlogPosts } from "~/server/blogs";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const staticPaths: Array<{ path: string; changeFrequency?: MetadataRoute.Sitemap[0]["changeFrequency"]; priority?: number }> = [
    { path: "/", changeFrequency: "weekly", priority: 1 },
    { path: "/about", changeFrequency: "monthly", priority: 0.6 },
    { path: "/services", changeFrequency: "weekly", priority: 0.9 },
    { path: "/portfolio", changeFrequency: "monthly", priority: 0.5 },
    { path: "/testimonials", changeFrequency: "monthly", priority: 0.5 },
    { path: "/pricing", changeFrequency: "weekly", priority: 0.8 },
    { path: "/blog", changeFrequency: "weekly", priority: 0.7 },
    { path: "/contact", changeFrequency: "monthly", priority: 0.7 },
    { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
    { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
    { path: "/careers", changeFrequency: "monthly", priority: 0.3 },
    { path: "/changelog", changeFrequency: "weekly", priority: 0.4 },
    { path: "/community", changeFrequency: "monthly", priority: 0.4 },
    { path: "/docs", changeFrequency: "monthly", priority: 0.4 },
    { path: "/guides", changeFrequency: "monthly", priority: 0.4 },
    { path: "/roadmap", changeFrequency: "monthly", priority: 0.4 },
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map(({ path, changeFrequency, priority }) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));

  const dynamicEntries: MetadataRoute.Sitemap = [];

  // Services dynamic routes
  try {
    const services = await getAllServices();
    for (const s of services) {
      const slug = slugifyServiceName(s.name);
      dynamicEntries.push({
        url: `${baseUrl}/services/${slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  } catch {
    // ignore; DB might be unavailable during static generation
  }

  // Blog dynamic routes
  try {
    const posts = await getAllBlogPosts();
    for (const p of posts) {
      dynamicEntries.push({
        url: `${baseUrl}/blog/${p.slug}`,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  } catch {
    // ignore; DB might be unavailable during static generation
  }

  return [...staticEntries, ...dynamicEntries];
}
