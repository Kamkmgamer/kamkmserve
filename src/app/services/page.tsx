import { getAllServices } from "~/server/services";
import ServicesClient from "./ServicesClient";

// Revalidate the list at most every 5 minutes
export const revalidate = 300;

export default async function ServicesPage() {
  const services = await getAllServices();
  return <ServicesClient initialServices={services} />;
}
