import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { sourceRegistry } from "../src/data/source-registry";
import { createSourceSnapshotMetadata } from "../src/server/sources/snapshot";

async function main() {
  const source = sourceRegistry.mccsDiveSites;
  const retrievedAt = new Date().toISOString();
  const response = await fetch(source.canonicalUrl, {
    headers: {
      Accept: "text/html",
      "User-Agent": "okinawa-ocean-intelligence-source-review/0.1",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(15_000),
  });

  const body = new Uint8Array(await response.arrayBuffer());
  const metadata = createSourceSnapshotMetadata({
    sourceId: source.id,
    canonicalUrl: source.canonicalUrl,
    resolvedUrl: response.url,
    retrievedAt,
    httpStatus: response.status,
    body,
    headers: response.headers,
  });

  if (!response.ok) {
    throw new Error(`Snapshot request failed with HTTP ${response.status}`);
  }

  const snapshotDirectory = path.join(process.cwd(), "data", "source-snapshots", source.id);
  const safeTimestamp = retrievedAt.replaceAll(":", "-");
  const outputPath = path.join(
    snapshotDirectory,
    `${safeTimestamp}-${metadata.contentHash.slice(0, 12)}.json`,
  );

  await mkdir(snapshotDirectory, { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(metadata, null, 2)}\n`, { flag: "wx" });

  console.log(outputPath);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
