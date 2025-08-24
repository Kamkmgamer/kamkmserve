import { notFound, redirect } from "next/navigation";
import { getServiceById, slugifyServiceName } from "~/server/services";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ServiceDetailPage({ params }: Props) {
  const { id } = await params;
  const service = await getServiceById(id);
  if (!service) return notFound();

  // Permanent redirect to slug route to avoid duplicate content
  const slug = slugifyServiceName(service.name);
  redirect(`/services/${slug}`);
}
