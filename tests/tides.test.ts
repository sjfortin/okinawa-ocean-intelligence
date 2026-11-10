import { describe, expect, it, vi } from "vitest";
import { fetchTideYear, parseTideTable } from "@/providers/jma/tides";
import { japanDate, nextTide, tideDates } from "@/domain/tides";
import { nahaTideStation } from "@/data/tide-stations";
import { getTides } from "@/server/tides/service";
import { GET } from "@/app/api/sites/[slug]/tides/route";

// Synthetic documented-format fixture; not copied source content.
function row(date = "2026-10-25", high = [[6, 20, 205], [18, 20, 214]], low = [[0, 9, 35], [12, 20, -3]]) {
  const field = (n: number, width: number) => String(n).padStart(width, " ");
  const slots = (events: number[][]) => [...events.map(([h, m, cm]) => field(h, 2) + field(m, 2) + field(cm, 3)), ...Array(4 - events.length).fill("9999999")].join("");
  const [year, month, day] = date.split("-").map(Number);
  return "100".repeat(24) + field(year % 100, 2) + field(month, 2) + field(day, 2) + "NH" + slots(high) + slots(low);
}
const stubFetch = (body: string) => vi.fn<typeof fetch>().mockResolvedValue(new Response(body, { headers: { "content-type": "text/plain" } }));

describe("JMA tide normalization", () => {
  it("parses published extrema in JST, sorts chronologically and converts cm to meters including negatives", () => {
    const [day] = parseTideTable(row(), 2026, "NH");
    expect(day.date).toBe("2026-10-25");
    expect(day.events).toEqual([
      { kind: "low", at: "2026-10-24T15:09:00.000Z", heightM: .35 },
      { kind: "high", at: "2026-10-24T21:20:00.000Z", heightM: 2.05 },
      { kind: "low", at: "2026-10-25T03:20:00.000Z", heightM: -.03 },
      { kind: "high", at: "2026-10-25T09:20:00.000Z", heightM: 2.14 },
    ]);
  });
  it("does not fabricate missing events and supports more than two highs", () => {
    expect(parseTideTable(row("2026-10-25", [], []), 2026, "NH")[0].events).toEqual([]);
    expect(parseTideTable(row("2026-10-25", [[1, 0, 100], [10, 0, 110], [20, 0, 120]], []), 2026, "NH")[0].events).toHaveLength(3);
  });
  it.each([
    ["wrong station", () => row().replace("NH", "TK")],
    ["wrong year", () => row("2025-10-25")],
    ["invalid date", () => row("2026-02-30")],
    ["invalid time", () => row("2026-10-25", [[24, 0, 100]])],
    ["invalid minute", () => row("2026-10-25", [[12, 60, 100]])],
    ["missing height only", () => row("2026-10-25", [[12, 0, 999]])],
    ["truncated row", () => row().slice(0, -1)],
    ["duplicate date", () => row() + "\n" + row()],
    ["duplicate event", () => row("2026-10-25", [[12, 0, 100]], [[12, 0, 10]])],
    ["HTML response", () => "<html>Maintenance</html>"],
  ])("rejects %s", (_label, malformed) => {
    expect(() => parseTideTable(malformed(), 2026, "NH")).toThrow();
  });
  it("preserves source hash, locator, retrieval metadata and never stores the body", async () => {
    const fetch = stubFetch(row());
    const result = await fetchTideYear(nahaTideStation, 2026, fetch);
    expect(fetch.mock.calls[0][0]).toBe("https://www.data.jma.go.jp/kaiyou/data/db/tide/suisan/txt/2026/NH.txt");
    expect(result.source.contentHash).toMatch(/^[a-f0-9]{64}$/);
    expect(result.days[0].sourceHash).toBe(result.source.contentHash);
    expect(result.days[0].sourceLocator).toContain("Line 1");
    expect(result.source.bodyStored).toBe(false);
    expect(result).not.toHaveProperty("body");
  });
  it("fails visibly on upstream outages", async () => {
    await expect(fetchTideYear(nahaTideStation, 2026, vi.fn<typeof fetch>().mockResolvedValue(new Response("", { status: 503 })))).rejects.toThrow("503");
  });
});

describe("daily tide report", () => {
  it("uses Japan calendar dates independently of UTC and crosses year boundaries", () => {
    const now = Date.parse("2026-12-31T15:00:00Z");
    expect(japanDate(now)).toBe("2027-01-01");
    expect(tideDates(now)).toEqual(["2027-01-01", "2027-01-02", "2027-01-03"]);
  });
  it("loads both annual tables when needed and finds the next event across midnight", async () => {
    const loader = vi.fn(async (_station, year) => fetchTideYear(nahaTideStation, year, stubFetch(year === 2026 ? row("2026-12-31") : row("2027-01-01") + "\n" + row("2027-01-02"))));
    const now = Date.parse("2026-12-31T14:59:00Z");
    const report = await getTides(nahaTideStation, now, loader);
    expect(loader.mock.calls.map((call) => call[1])).toEqual([2026, 2027]);
    expect(report.days.map((day) => day.date)).toEqual(["2026-12-31", "2027-01-01", "2027-01-02"]);
    expect(nextTide(report, now)?.at).toBe("2026-12-31T15:09:00.000Z");
    expect(nextTide(report, Date.parse("2027-01-03T00:00:00Z"))).toBeNull();
  });
  it("does not present missing dates as days without tides", async () => {
    const loader = async () => fetchTideYear(nahaTideStation, 2026, stubFetch(row()));
    await expect(getTides(nahaTideStation, Date.parse("2026-10-25T00:00:00Z"), loader)).rejects.toThrow("missing for 2026-10-26");
  });
  it("rejects unknown and unmapped sites before fetching", async () => {
    expect((await GET(new Request("http://localhost"), { params: Promise.resolve({ slug: "missing" }) })).status).toBe(404);
    expect((await GET(new Request("http://localhost"), { params: Promise.resolve({ slug: "maeda-flats" }) })).status).toBe(422);
  });
});
