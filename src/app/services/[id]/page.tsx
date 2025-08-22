import { notFound } from "next/navigation";
import { getServiceById } from "~/server/services";
import ServiceDetailClient from "./ServiceDetailClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ServiceDetailPage({ params }: Props) {
  const { id } = await params;
  const service = await getServiceById(id);
  if (!service) return notFound();
  return <ServiceDetailClient service={service} />;
}
