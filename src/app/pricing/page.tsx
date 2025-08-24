import { Card, CardContent, CardFooter, CardHeader } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import fs from "node:fs/promises";
import path from "node:path";

export const metadata = {
  title: "Pricing | KAMKM Serve",
  description: "Plans and pricing for KAMKM Serve",
};

type Tier = {
  name: string;
  price: string; // number-like or "Custom"
  period: string; // e.g., month | ""
  description: string;
  highlighted: boolean;
  features: string[];
};

function parseCsv(text: string): Tier[] {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i++; // skip escaped quote
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        row.push(field);
        field = "";
      } else if (ch === '\n') {
        row.push(field);
        field = "";
        if (row.length > 1 || row[0]?.trim().length) rows.push(row);
        row = [];
      } else if (ch === '\r') {
        // ignore
      } else {
        field += ch;
      }
    }
  }
  // push last field/row if any
  if (field.length > 0 || row.length) {
    row.push(field);
    if (row.length > 1 || row[0]?.trim().length) rows.push(row);
  }

  // header: name,price,period,description,highlighted,features
  const [header, ...data] = rows;
  if (!header) return [];
  const idx = (k: string) => header.indexOf(k);
  return data.map((cols) => {
    const featuresRaw = cols[idx("features")] ?? "";
    const features = featuresRaw
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean);
    const price = (cols[idx("price")] ?? "").trim();
    const highlightedStr = (cols[idx("highlighted")] ?? "false").trim().toLowerCase();
    return {
      name: (cols[idx("name")] ?? "").trim(),
      price: price === "" ? "Custom" : price,
      period: (cols[idx("period")] ?? "").trim(),
      description: (cols[idx("description")] ?? "").trim(),
      highlighted: highlightedStr === "true" || highlightedStr === "1",
      features,
    } satisfies Tier;
  });
}

async function loadTiers(): Promise<Tier[]> {
  const csvPath = path.join(process.cwd(), "src", "data", "pricing.csv");
  const csv = await fs.readFile(csvPath, "utf8");
  return parseCsv(csv);
}

export default async function PricingPage() {
  const tiers = await loadTiers();

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
                <span className="text-4xl font-bold">
                  {tier.price.toLowerCase() === "custom" ? "Custom" : `$${tier.price}`}
                </span>
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
