import { notFound } from "next/navigation";
import { getAllServices, getServiceBySlug, slugifyServiceName } from "~/server/services";
import ServiceDetailClient from "../[id]/ServiceDetailClient";

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

  return <ServiceDetailClient service={service} related={related} />;
}

export async function generateStaticParams() {
  const services = await getAllServices();
  return services.map((s) => ({ slug: slugifyServiceName(s.name) }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return {};
  return {
    title: `${service.name} | Services`,
    description: service.description,
  };
}
