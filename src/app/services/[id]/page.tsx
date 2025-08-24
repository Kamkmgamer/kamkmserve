import { notFound } from "next/navigation";
import { getAllServices, getServiceById } from "~/server/services";
import ServiceDetailClient from "./ServiceDetailClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ServiceDetailPage({ params }: Props) {
  const { id } = await params;
  const service = await getServiceById(id);
  if (!service) return notFound();

  // Compute related services (same category, exclude current), limit 3
  const all = await getAllServices();
  const related = all.filter((s) => s.category === service.category && s.id !== service.id).slice(0, 3);

  return <ServiceDetailClient service={service} related={related} />;
}
