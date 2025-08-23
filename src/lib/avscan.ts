// Optional antivirus scan hook. Returns ok: true by default.
// To enable a real scan, set AVSCAN_MODE=reject to simulate, or integrate a provider.
// Replace the implementation with a call to your AV service (e.g., Cloud Functions, ClamAV microservice, VirusTotal).

export async function avScan(_buffer: Buffer): Promise<{ ok: boolean; reason?: string }> {
  try {
    const mode = (process.env.AVSCAN_MODE ?? "off").toLowerCase();
    if (mode === "reject") {
      // Simulate a detection for testing pipelines
      return { ok: false, reason: "simulated-detection" };
    }
    // In real usage, call out to your scanner here, e.g.:
    // const res = await fetch(process.env.AVSCAN_URL!, { method: 'POST', body: buffer });
    // const json = await res.json();
    // return { ok: json.clean, reason: json.reason };
    return { ok: true };
  } catch (_e) {
    // Fail closed or open depending on policy; we choose fail-closed for safety
    return { ok: false, reason: "scan-error" };
  }
}
