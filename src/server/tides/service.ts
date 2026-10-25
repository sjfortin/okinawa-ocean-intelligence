import { tideDates, type TideReport, type TideStation } from "@/domain/tides";
import { fetchTideYear } from "@/providers/jma/tides";

type YearResult = Awaited<ReturnType<typeof fetchTideYear>>;
const cache = new Map<string, { expiresAt: number; result: Promise<YearResult> }>();
async function cachedYear(station: TideStation, year: number): Promise<YearResult> {
  const key = `${station.id}:${year}`;
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.result;
  const result = fetchTideYear(station, year);
  const entry = { expiresAt: Date.now() + 3_600_000, result };
  cache.set(key, entry);
  try { return await result; } catch (error) { if (cache.get(key) === entry) cache.delete(key); throw error; }
}
export async function getTides(station: TideStation, now = Date.now(), loadYear = cachedYear): Promise<TideReport> {
  const dates = tideDates(now);
  const years = [...new Set(dates.map((date) => Number(date.slice(0, 4))))];
  const results = await Promise.all(years.map((year) => loadYear(station, year)));
  const days = dates.map((date) => {
    const day = results.flatMap((result) => result.days).find((item) => item.date === date);
    if (!day) throw new Error(`JMA prediction missing for ${date}`);
    return day;
  });
  return { station, timezone: "Asia/Tokyo", kind: "astronomical_prediction", days, sources: results.map((result) => result.source) };
}
