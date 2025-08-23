import { Card, CardContent, CardFooter, CardHeader } from "~/components/ui/card";
import { Button } from "~/components/ui/button";

export const metadata = {
  title: "Pricing | KAMKM Serve",
  description: "Plans and pricing for KAMKM Serve",
};

export default function PricingPage() {
  const tiers = [
    {
      name: "Starter",
      price: "$59",
      period: "month",
      description: "Perfect for individuals and small projects.",
      features: [
        "1 Project",
        "Basic analytics",
        "Email support",
        "Community access",
      ],
      highlighted: false,
    },
    {
      name: "Pro",
      price: "$149",
      period: "month",
      description: "For growing teams that need more power.",
      features: [
        "Up to 10 Projects",
        "Advanced analytics",
        "Priority email support",
        "Integrations (Slack, Zapier, etc.)",
      ],
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "Tailored solutions for large organizations.",
      features: [
        "Unlimited Projects",
        "Dedicated success manager",
        "24/7 phone & chat support",
        "Custom integrations",
      ],
      highlighted: false,
    },
  ];

  return (
    <main className="container mx-auto max-w-6xl px-4 py-20">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Pricing</h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
          Choose a plan that fits your needs and scale as you grow.
        </p>
      </div>

      <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {tiers.map((tier) => (
          <Card
            key={tier.name}
            className={
              tier.highlighted
                ? "shadow-lg ring-2 ring-blue-500 border-blue-500"
                : undefined
            }
          >
            <CardHeader>
              <h2 className="text-xl font-semibold">{tier.name}</h2>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                {tier.description}
              </p>
            </CardHeader>
            <CardContent>
              <div className="mt-4">
                <span className="text-4xl font-bold">{tier.price}</span>
                {tier.period && (
                  <span className="text-slate-600 dark:text-slate-400">
                    /{tier.period}
                  </span>
                )}
              </div>
              <ul className="mt-6 space-y-3 text-slate-700 dark:text-slate-300">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <span className="text-green-500">✔</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full mt-2"
                size="lg"
                variant={tier.highlighted ? "primary" : "secondary"}
              >
                {tier.name === "Enterprise" ? "Contact Sales" : "Get Started"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </main>
  );
}
