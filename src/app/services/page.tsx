import { getAllServices } from "~/server/services";
import { type Metadata } from "next";
import ServicesClient from "./ServicesClient";

// Revalidate the list at most every 5 minutes
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Services | KAMKM Serve",
  description:
    "Explore development and design services: web apps, websites, UI/UX, and consulting focused on performance, accessibility, and great UX.",
  alternates: { canonical: "/services" },
  openGraph: {
    title: "Services | KAMKM Serve",
    description:
      "Explore development and design services: web apps, websites, UI/UX, and consulting focused on performance, accessibility, and great UX.",
    type: "website",
    url: "/services",
  },
  twitter: {
    card: "summary_large_image",
    title: "Services | KAMKM Serve",
    description: "Explore development and design services: web apps, websites, UI/UX, and consulting focused on performance, accessibility, and great UX.",
  },
};

export default async function ServicesPage() {
  const services = await getAllServices();
  return <ServicesClient initialServices={services} />;
}
