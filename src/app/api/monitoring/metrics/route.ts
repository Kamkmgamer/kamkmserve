import { NextResponse } from "next/server";
import { getMetricsForExport } from "~/lib/metrics";

export const runtime = "nodejs";

function escapeLabelValue(v: string) {
  return v.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/"/g, '\\"');
}

function toPrometheus() {
  const { metrics, requests, system } = getMetricsForExport();
  const lines: string[] = [];

  lines.push("# HELP process_uptime_seconds Process uptime in seconds");
  lines.push("# TYPE process_uptime_seconds gauge");
  lines.push(`process_uptime_seconds ${system.uptime}`);

  lines.push("# HELP process_memory_used_bytes Heap used bytes");
  lines.push("# TYPE process_memory_used_bytes gauge");
  lines.push(`process_memory_used_bytes ${system.memory.used}`);

  lines.push("# HELP process_memory_total_bytes Heap total bytes");
  lines.push("# TYPE process_memory_total_bytes gauge");
  lines.push(`process_memory_total_bytes ${system.memory.total}`);

  // Custom metrics
  const byName = new Map<string, { unit: string; samples: { value: number; tags?: Record<string, string> }[] }>();
  for (const m of metrics) {
    const entry = byName.get(m.name) ?? { unit: m.unit, samples: [] };
    entry.samples.push({ value: m.value, tags: m.tags });
    byName.set(m.name, entry);
  }

  for (const [name, { samples }] of byName.entries()) {
    lines.push(`# HELP ${name} Auto-exported metric`);
    lines.push(`# TYPE ${name} gauge`);
    for (const s of samples) {
      const labels = s.tags
        ? "{" + Object.entries(s.tags)
            .map(([k, v]) => `${k}="${escapeLabelValue(v)}"`)
            .join(",") + "}"
        : "";
      lines.push(`${name}${labels} ${s.value}`);
    }
  }

  // Request metrics summaries
  lines.push("# HELP http_requests_total Total HTTP requests observed");
  lines.push("# TYPE http_requests_total counter");
  for (const r of requests) {
    const labels = `{method="${escapeLabelValue(r.method)}",path="${escapeLabelValue(r.path)}",status="${r.statusCode}"}`;
    lines.push(`http_requests_total${labels} 1`);
  }

  return lines.join("\n") + "\n";
}

export async function GET() {
  const body = toPrometheus();
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; version=0.0.4",
      "Cache-Control": "no-store",
    },
  });
}
