import type { TideDay, TideEvent, TideStation } from "@/domain/tides";
import { createSourceSnapshotMetadata } from "@/server/sources/snapshot";

function integer(field: string): number {
  if (!/^ *-?\d+$/.test(field)) throw new Error("Invalid JMA integer field");
  return Number(field);
}
/** JMA's documented 136-column annual tide table, not HTML or inferred extrema. */
export function parseTideTable(body: string, year: number, stationId: string): Omit<TideDay, "sourceHash">[] {
  if (!Number.isInteger(year) || year < 2000 || year > 2099) throw new Error("Unsupported tide-table year");
  const lines = body.replace(/\r\n/g, "\n").split("\n").filter((line) => line.length > 0);
  if (!lines.length) throw new Error("Empty JMA tide table");
  const dates = new Set<string>();
  return lines.map((line, index) => {
    if (line.length !== 136 || line.slice(78, 80) !== stationId) throw new Error("Unexpected JMA table format or station");
    // Validate the hourly section even though only published extrema are exposed.
    for (let offset = 0; offset < 72; offset += 3) integer(line.slice(offset, offset + 3));
    if (integer(line.slice(72, 74)) !== year % 100) throw new Error("JMA table year mismatch");
    const month = integer(line.slice(74, 76));
    const day = integer(line.slice(76, 78));
    const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const parsedDate = new Date(`${date}T00:00:00Z`);
    if (!Number.isFinite(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== date || dates.has(date)) throw new Error("Invalid or duplicate JMA date");
    dates.add(date);
    const events: TideEvent[] = [];
    for (const [kind, start] of [["high", 80], ["low", 108]] as const) {
      for (let slot = 0; slot < 4; slot++) {
        const offset = start + slot * 7;
        const time = line.slice(offset, offset + 4);
        const heightCm = integer(line.slice(offset + 4, offset + 7));
        if (time === "9999" && heightCm === 999) continue;
        if (time === "9999" || heightCm === 999) throw new Error("Inconsistent missing tide event");
        const hour = integer(time.slice(0, 2));
        const minute = integer(time.slice(2, 4));
        if (hour < 0 || hour > 23 || minute < 0 || minute > 59) throw new Error("Invalid JMA event time");
        const at = new Date(`${date}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00+09:00`).toISOString();
        if (events.some((event) => event.at === at)) throw new Error("Duplicate tide event time");
        events.push({ kind, at, heightM: heightCm / 100 });
      }
    }
    events.sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
    return { date, events, sourceLocator: `Line ${index + 1}; ${date}; high columns 81–108, low columns 109–136` };
  });
}

export async function fetchTideYear(station: TideStation, year: number, fetchImpl: typeof fetch = fetch) {
  if (!/^[A-Z0-9]{2}$/.test(station.id) || !Number.isInteger(year) || year < 2000 || year > 2099) throw new Error("Invalid tide request");
  const url = `https://www.data.jma.go.jp/kaiyou/data/db/tide/suisan/txt/${year}/${station.id}.txt`;
  const response = await fetchImpl(url, { signal: AbortSignal.timeout(10_000), cache: "no-store" });
  if (!response.ok) throw new Error(`JMA tide table unavailable (${response.status})`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  const parsed = parseTideTable(new TextDecoder().decode(bytes), year, station.id);
  const source = createSourceSnapshotMetadata({ sourceId: `jma-tides-${station.id}`, canonicalUrl: url, resolvedUrl: response.url || url,
    retrievedAt: new Date().toISOString(), httpStatus: response.status, body: bytes, headers: response.headers });
  return { source, days: parsed.map((day) => ({ ...day, sourceHash: source.contentHash })) };
}
