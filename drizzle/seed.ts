/*
  Drizzle Seed Script for KamkmServe – Real data
  Run with: ts-node drizzle/seed.ts (or node after ts-node/register setup)
*/

import { db } from "../src/server/db";
import { users, services } from "../src/server/db/schema";

async function seed() {
  console.log("Seeding real project data...");

  // 1) Admin user (Clerk-based). No password column in schema.
  const admin = {
    clerkUserId: "seed-admin-1",
    email: "admin@example.com",
    name: "Admin",
    role: "ADMIN" as const,
  };
  try {
    await db.insert(users).values(admin);
    console.log("✔ Inserted admin user");
  } catch (err) {
    console.warn("↺ Admin user already exists or failed to insert:", (err as Error).message);
  }

  // 2) Services catalog (from existing seed data)
  const catalog = [
    {
      name: "Portfolio Website",
      description:
        "Showcase your work with a beautiful, modern portfolio site designed for creatives, agencies, and professionals.",
      price: 499,
      features: JSON.stringify([
        "Responsive design for all devices",
        "Gallery and portfolio sections",
        "Contact form with email notifications",
        "SEO optimization for better visibility",
      ]),
      category: "Web Design",
      thumbnailUrl:
        "https://ik.imagekit.io/gtnmxyt2d/servises%20store/Portfolio%20Website/image%206.png",
      imageUrls: JSON.stringify([
        "https://ik.imagekit.io/gtnmxyt2d/servises%20store/Portfolio%20Website/image%205.png",
        "https://ik.imagekit.io/gtnmxyt2d/servises%20store/Portfolio%20Website/image%204.png",
        "https://ik.imagekit.io/gtnmxyt2d/servises%20store/Portfolio%20Website/image%203.png",
        "https://ik.imagekit.io/gtnmxyt2d/servises%20store/Portfolio%20Website/image%207.png",
        "https://ik.imagekit.io/gtnmxyt2d/servises%20store/Portfolio%20Website/thumpnail.png",
        "https://ik.imagekit.io/gtnmxyt2d/servises%20store/Portfolio%20Website/image%201.png",
      ]),
    },
    {
      name: "Landing Page",
      description:
        "A high-converting single-page site for marketing, lead generation, or product launches.",
      price: 299,
      features: JSON.stringify([
        "One-page modern design",
        "Lead capture and signup forms",
        "Google Analytics integration",
        "Lightning-fast loading speed",
      ]),
      category: "Web Design",
      thumbnailUrl:
        "https://ik.imagekit.io/gtnmxyt2d/servises%20store/Landing%20Page/thumpnail.png",
      imageUrls: JSON.stringify([""]),
    },
    {
      name: "E-commerce Website",
      description:
        "A complete online store solution with secure payments and advanced inventory management.",
      price: 1499,
      features: JSON.stringify([
        "Product catalog and filters",
        "Shopping cart and checkout",
        "Payment gateway integration",
        "Order and customer management",
        "Multi-vendor and dropshipping ready",
      ]),
      category: "E-commerce",
      thumbnailUrl:
        "https://ik.imagekit.io/gtnmxyt2d/servises%20store/E-commerce%20Website/thubnail.png",
      imageUrls: JSON.stringify([""])
    },
    {
      name: "Business/Corporate Website",
      description:
        "Professional websites for companies and organizations to build trust and showcase their services.",
      price: 899,
      features: JSON.stringify([
        "Team and services pages",
        "Contact forms and maps",
        "News/blog section",
        "Custom branding and design",
      ]),
      category: "Web Design",
      thumbnailUrl:
        "https://ik.imagekit.io/gtnmxyt2d/servises%20store/Business%20Corporate%20Website/thumbnail.png",
      imageUrls: JSON.stringify([""])
    },
    {
      name: "Blog/Personal Website",
      description: "A platform to share articles, tutorials, or stories with an audience.",
      price: 399,
      features: JSON.stringify([
        "Blog engine with categories",
        "Comments and moderation tools",
        "Social media sharing integration",
        "SEO optimized for writers",
      ]),
      category: "Web Design",
      thumbnailUrl:
        "https://ik.imagekit.io/gtnmxyt2d/servises%20store/Blog%20Personal%20Website/tumbnail.png",
      imageUrls: JSON.stringify([""])
    },
    {
      name: "Odoo Custom Development",
      description:
        "Tailored Odoo modules for HR, CRM, Accounting, and more to streamline your business operations.",
      price: 1999,
      features: JSON.stringify([
        "Custom HR modules (training, attendance, payroll)",
        "CRM setup for lead management",
        "Inventory and warehouse management",
        "Third-party API integrations",
      ]),
      category: "Odoo",
      thumbnailUrl:
        "https://ik.imagekit.io/gtnmxyt2d/servises%20store/Odoo%20Custom%20Development/thumbnail.png",
      imageUrls: JSON.stringify([""])
    },
    {
      name: "Website Maintenance & Optimization",
      description:
        "Keep your website running fast and secure with regular updates, backups, and optimizations.",
      price: 199,
      features: JSON.stringify([
        "Bug fixes and security patches",
        "Speed and performance optimization",
        "Regular backups",
        "SEO audits and improvements",
      ]),
      category: "Support",
      thumbnailUrl:
        "https://ik.imagekit.io/gtnmxyt2d/servises%20store/Website%20Maintenance%20&%20Optimization/thumbnail.png",
      imageUrls: JSON.stringify([""])
    },
    {
      name: "AI Integration for Websites",
      description:
        "Add smart AI features like chatbots, analytics, and content personalization to your website.",
      price: 899,
      features: JSON.stringify([
        "AI-powered chatbots for customer support",
        "Dynamic content recommendations",
        "Language translation using AI",
        "Data dashboards with AI analytics",
      ]),
      category: "AI",
      thumbnailUrl:
        "https://ik.imagekit.io/gtnmxyt2d/servises%20store/AI%20Website%20Integration/thumbnail.png",
      imageUrls: JSON.stringify([""])
    },
    {
      name: "Tech Consultation & Digital Strategy",
      description:
        "Get expert advice on web technologies, platform choices, and scaling your online presence.",
      price: 99,
      features: JSON.stringify([
        "1-hour strategy session",
        "Platform and CMS recommendations",
        "Hosting and domain setup advice",
        "Scalable tech stack planning",
      ]),
      category: "Consulting",
      thumbnailUrl:
        "https://ik.imagekit.io/gtnmxyt2d/servises%20store/Tech%20Consultation%20&%20Digital%20Strategy/thumbnail.png",
      imageUrls: JSON.stringify([""])
    },
    {
      name: "UI/UX Design",
      description:
        "Beautiful and user-friendly designs crafted for an excellent user experience.",
      price: 499,
      features: JSON.stringify([
        "Figma/Adobe XD design mockups",
        "Responsive and modern aesthetics",
        "Wireframes and prototypes",
        "Focus on usability and conversion",
      ]),
      category: "Design",
      thumbnailUrl:
        "https://ik.imagekit.io/gtnmxyt2d/servises%20store/UIUX%20Design/image%202.png",
      imageUrls: JSON.stringify([
        "https://ik.imagekit.io/gtnmxyt2d/servises%20store/UIUX%20Design/image%201.png",
        "https://ik.imagekit.io/gtnmxyt2d/servises%20store/UIUX%20Design/thumpnail.png",
      ]),
    },
  ];

  for (const s of catalog) {
    try {
      await db.insert(services).values(s);
      console.log(`✔ Inserted service: ${s.name}`);
    } catch (err) {
      console.warn(`↺ Service already exists or failed to insert (${s.name}):`, (err as Error).message);
    }
  }

  console.log("✅ Seeding completed.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
