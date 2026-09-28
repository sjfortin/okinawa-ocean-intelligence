import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { OpenMeteoProvider } from "../src/providers/open-meteo/client";

async function main() {
  // Deliberately offshore; this is a provider-contract point, not a catalog entry.
  const request = { latitude: 26.35, longitude: 127.65, forecastDays: 1, timezone: "Asia/Tokyo" };
  const bodies = new Map<string, string>();
  const provider = new OpenMeteoProvider({
    timeoutMs: 30000,
    fetchImpl: async (input, init) => {
      const response = await fetch(input, init);
      bodies.set(new URL(String(input)).pathname, await response.clone().text());
      return response;
    },
  });
  const result = await provider.getForecast(request);
  const directory = path.resolve(process.argv[2] ?? `tests/fixtures/open-meteo/${result.metadata[0].requestedAt.slice(0, 10)}`);
  await mkdir(directory, { recursive: true });
  for (const run of result.metadata) {
    await writeFile(path.join(directory, `${run.provider}.json`), bodies.get(new URL(run.endpoint).pathname)!, { flag: "wx" });
  }
  await writeFile(path.join(directory, "manifest.json"), JSON.stringify({
    request,
    metadata: result.metadata,
    warnings: result.warnings,
    attribution: "Weather and marine data by Open-Meteo (https://open-meteo.com/).",
    license: "https://creativecommons.org/licenses/by/4.0/",
    modifications: "Response bodies preserved as received; manifest and normalization are project-generated.",
  }, null, 2) + "\n", { flag: "wx" });
  console.log(`Recorded ${result.hours.length} normalized hours in ${directory}`);
}

main().catch((error: unknown) => { console.error(error); process.exitCode = 1; });
