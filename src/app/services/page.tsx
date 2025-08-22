import { getAllServices } from "~/server/services";
import ServicesClient from "./ServicesClient";

export const dynamic = "force-dynamic"; // list can change often

export default async function ServicesPage() {
  const services = await getAllServices();
  return <ServicesClient initialServices={services} />;
}
