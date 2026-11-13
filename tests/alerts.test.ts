import { describe, expect, it } from "vitest";
import { fetchSiteAlerts, normalizeWeatherAlerts } from "@/providers/jma/alerts";

const kadena = "4732500";
const chatan = "4732600";
const reportedAt = "2026-11-10T23:07:00+09:00";
const none = { status: "発表警報・注意報はなし" };
const issued = (code: string) => ({ code, status: "発表" });

function bulletin(dataTypeCode: string, local: { status: string; code?: string } = none, neighboring = none) {
  return {
    dataTypeCode, infoType: "発表", reportDatetime: reportedAt, controlDatetime: "2026-11-10T14:07:41Z",
    warning: { class20Items: [
      { areaCode: kadena, kinds: [local] },
      { areaCode: chatan, kinds: [neighboring] },
    ] },
  };
}

describe("JMA coastal alerts", () => {
  it("uses the municipality, retains continuations and prioritizes warnings", () => {
    const reports = [
      bulletin("VPWW57", issued("48")),
      bulletin("VPWW58", none, issued("15")),
      bulletin("VPWW59", { code: "16", status: "継続" }),
      bulletin("VPWW61", issued("21")),
    ];
    const report = normalizeWeatherAlerts(reports, kadena);
    expect(report.complete).toBe(true);
    expect(report.alerts.map((alert) => alert.title)).toEqual(["Level 4 storm surge danger warning", "High wave advisory"]);
    expect(report.alerts[1]).toMatchObject({ reportedAt, sourceLocator: expect.stringContaining(kadena) });
    expect(normalizeWeatherAlerts(reports, chatan).alerts.map((alert) => alert.title)).toEqual(["Strong wind advisory"]);
  });

  it("uses the latest bulletin per product and ignores test messages", () => {
    const waves = bulletin("VPWW59", issued("07"));
    const cancellation = { ...bulletin("VPWW59", { code: "07", status: "解除" }), infoType: "訂正", controlDatetime: "2026-11-10T15:00:00Z" };
    const test = { ...waves, infoType: "試験", controlDatetime: "2026-11-10T16:00:00Z" };
    expect(normalizeWeatherAlerts([cancellation, test, waves, ...["VPWW57", "VPWW58", "VPWW61"].map((id) => bulletin(id))], kadena))
      .toEqual({ complete: true, alerts: [] });
  });

  it("preserves known alerts when another bulletin or municipality is missing", () => {
    expect(normalizeWeatherAlerts([bulletin("VPWW59", issued("16"))], kadena)).toMatchObject({
      complete: false, alerts: [{ title: "High wave advisory" }],
    });
    expect(normalizeWeatherAlerts([bulletin("VPWW59", issued("16"))], "missing")).toEqual({ complete: false, alerts: [] });
  });

  it("captures retrieval provenance and fails on an upstream outage", async () => {
    const report = await fetchSiteAlerts(kadena, async () => Response.json([bulletin("VPWW59", issued("16"))]));
    expect(report.source).toMatchObject({ sourceId: "jma-okinawa-weather-warnings", contentHash: expect.stringMatching(/^[a-f0-9]{64}$/), bodyStored: false });
    await expect(fetchSiteAlerts(kadena, async () => new Response(null, { status: 503 }))).rejects.toThrow("503");
  });
});
