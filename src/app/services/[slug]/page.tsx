import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { env } from "~/env";
import { getAllServices, getServiceBySlug, slugifyServiceName } from "~/server/services";
import ServiceDetailClient from "../_components/ServiceDetailClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ServiceDetailBySlugPage({ params }: Props) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return notFound();

  const all = await getAllServices();
  const related = all
    .filter((s) => s.category === service.category && s.id !== service.id)
    .slice(0, 3);

  const siteUrl = env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const url = `${siteUrl}/services/${slug}`;
  const images = service.thumbnailUrl ? [service.thumbnailUrl] : undefined;
  const ld = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.description,
    category: service.category,
    url,
    image: images,
    provider: { "@type": "Organization", name: "KAMKM Serve", url: siteUrl },
  };

  return (
    <>
      <ServiceDetailClient service={service} related={related} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
    </>
  );
}

export async function generateStaticParams() {
  const services = await getAllServices();
  return services.map((s) => ({ slug: slugifyServiceName(s.name) }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return {};
  const canonical = `/services/${slug}`;
  const title = `${service.name} | Services | KAMKM Serve`;
  const description = service.description;
  const ogImages = service.thumbnailUrl ? [{ url: service.thumbnailUrl }] : undefined;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      title,
      description,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: service.thumbnailUrl ? [service.thumbnailUrl] : undefined,
    },
  };
}
