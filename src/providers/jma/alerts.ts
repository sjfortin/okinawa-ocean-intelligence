import { z } from "zod";
import { sourceRegistry } from "@/data/source-registry";
import type { SiteAlertReport, WeatherAlert } from "@/domain/alerts";
import { createSourceSnapshotMetadata } from "@/server/sources/snapshot";

const sourceDefinition = sourceRegistry.jmaWeatherWarnings;
const endpoint = sourceDefinition.canonicalUrl;

// Code tables: https://xml.kishou.go.jp/tec_material.html (R06 weather warning manual).
// The website JSON is an
// internal interface. TODO: monitor the R8 format and verify any replacement
// against JMA's published warning products before switching endpoints.
const products: { id: string; label: string; advisory: string; warnings: Record<string, string> }[] = [
  { id: "VPWW57", label: "Storm surge", advisory: "19", warnings: { "08": "Level 3 storm surge warning", "48": "Level 4 storm surge danger warning", "38": "Level 5 storm surge emergency warning" } },
  { id: "VPWW58", label: "Wind", advisory: "15", warnings: { "05": "Storm-force wind warning", "35": "Storm-force wind emergency warning" } },
  { id: "VPWW59", label: "High wave", advisory: "16", warnings: { "07": "High wave warning", "37": "High wave emergency warning" } },
  { id: "VPWW61", label: "Thunderstorm", advisory: "14", warnings: {} },
];

const header = z.object({
  dataTypeCode: z.string(),
  controlDatetime: z.string().datetime({ offset: true }),
  reportDatetime: z.string().datetime({ offset: true }),
  infoType: z.string(),
});
const municipalities = z.object({
  warning: z.object({
    class20Items: z.array(z.object({ areaCode: z.string(), kinds: z.unknown() })),
  }),
});
const kindsSchema = z.array(z.object({
  code: z.string().optional(),
  status: z.enum(["発表", "継続", "解除", "発表警報・注意報はなし"]),
})).min(1);

export function normalizeWeatherAlerts(input: unknown, areaCode: string): Omit<SiteAlertReport, "source"> {
  const reports = z.array(z.unknown()).min(1).parse(input).map((raw) => ({ ...header.parse(raw), raw }));
  const alerts: WeatherAlert[] = [];
  let complete = true;

  for (const product of products) {
    const report = reports.filter((item) => item.dataTypeCode === product.id && item.infoType !== "試験")
      .sort((a, b) => Date.parse(b.controlDatetime) - Date.parse(a.controlDatetime))[0];
    const data = municipalities.safeParse(report?.raw);
    const areas = data.success ? data.data.warning.class20Items.filter((area) => area.areaCode === areaCode) : [];
    const kinds = kindsSchema.safeParse(areas[0]?.kinds);
    if (!report || !["発表", "訂正"].includes(report.infoType) || areas.length !== 1 || !kinds.success) {
      complete = false;
      continue;
    }

    for (const { code, status } of kinds.data) {
      if (status === "解除" || status === "発表警報・注意報はなし") continue;
      if (!code) {
        complete = false;
        continue;
      }
      // VPWW61 also carries advisories unrelated to this coastal planning view.
      if (product.id === "VPWW61" && ["17", "20", "21", "22", "23", "24", "25", "26"].includes(code)) continue;
      const severity = code === product.advisory ? "advisory" : Object.hasOwn(product.warnings, code) ? "warning" : "unspecified";
      const title = severity === "advisory"
        ? (product.id === "VPWW58" ? "Strong wind advisory" : `${product.label} advisory`)
        : severity === "warning" ? product.warnings[code] : `JMA ${product.id === "VPWW61" ? "weather" : product.label.toLowerCase()} alert`;
      alerts.push({
        id: `${product.id}/${areaCode}/${code}`,
        title,
        severity,
        reportedAt: report.reportDatetime,
        sourceLocator: `${product.id} · municipality ${areaCode} · code ${code}`,
      });
    }
  }
  const order = { warning: 0, unspecified: 1, advisory: 2 };
  return { alerts: alerts.sort((a, b) => order[a.severity] - order[b.severity]), complete };
}

export async function fetchSiteAlerts(areaCode: string, fetchImpl: typeof fetch = fetch): Promise<SiteAlertReport> {
  const response = await fetchImpl(endpoint, { cache: "no-store", signal: AbortSignal.timeout(8_000) });
  if (!response.ok) throw new Error(`JMA weather alert feed unavailable (${response.status})`);
  const body = new Uint8Array(await response.arrayBuffer());
  const report = normalizeWeatherAlerts(JSON.parse(new TextDecoder().decode(body)), areaCode);
  const source = createSourceSnapshotMetadata({
    sourceId: sourceDefinition.id,
    canonicalUrl: endpoint,
    resolvedUrl: response.url || endpoint,
    retrievedAt: new Date().toISOString(),
    httpStatus: response.status,
    body,
    headers: response.headers,
  });
  return { ...report, source };
}
