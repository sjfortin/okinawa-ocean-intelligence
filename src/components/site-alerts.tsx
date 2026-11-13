"use client";

import { useEffect, useState } from "react";
import { planningReferences } from "@/data/site-focus";
import type { SiteAlertReport } from "@/domain/alerts";

const japanTime = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Tokyo", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
});

export function SiteAlerts({ slug, area, areaCode }: { slug: string; area: string; areaCode: string }) {
  const [report, setReport] = useState<SiteAlertReport | null | undefined>(undefined);
  useEffect(() => {
    let active: AbortController | undefined;
    async function refresh() {
      active?.abort();
      const request = new AbortController();
      active = request;
      try {
        const response = await fetch(`/api/sites/${encodeURIComponent(slug)}/alerts`, {
          signal: AbortSignal.any([request.signal, AbortSignal.timeout(12_000)]),
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Alert check failed");
        const result: SiteAlertReport = await response.json();
        if (!request.signal.aborted) setReport(result);
      } catch {
        if (!request.signal.aborted) setReport(null);
      }
    }
    function onVisible() {
      if (!document.hidden) void refresh();
    }
    void refresh();
    const timer = window.setInterval(onVisible, 2 * 60_000);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      active?.abort();
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [slug]);

  const alerts = report?.alerts ?? [];
  const source = `https://www.jma.go.jp/bosai/warning/#area_type=class20s&area_code=${areaCode}&lang=en`;
  return <section className="site-alerts" id="before-you-go" aria-labelledby="alerts-heading">
    <div className="site-alerts-header">
      <h2 id="alerts-heading">Check the entry locally</h2>
      <span>{area}{report && ` · Checked ${japanTime.format(new Date(report.source.retrievedAt))} JST`}</span>
    </div>
    <p className="entry-note">Local surf, currents and access need an on-site check.</p>
    <div role="status">
      {alerts.length > 0 && <ul className="site-alert-list">{alerts.map((alert) =>
        <li key={alert.id} data-severity={alert.severity}>
          <strong>{alert.title}</strong><span>JMA report · {japanTime.format(new Date(alert.reportedAt))} JST</span>
        </li>
      )}</ul>}
      {report === undefined && <p>Checking JMA weather alerts…</p>}
      {report === null && <p className="alert-unavailable">JMA weather alerts could not be checked. See the official source below.</p>}
      {report && !report.complete && <p className="alert-unavailable">Some JMA weather alerts could not be checked. See the official source below.</p>}
      {report?.complete && alerts.length === 0 && <p>JMA lists no wave, wind, thunderstorm or storm surge alerts.</p>}
    </div>
    <details className="alert-sources"><summary>Official sources</summary><div className="site-alert-links">
      {planningReferences.filter((reference) => reference.category === "alerts").map((reference) =>
        <a key={reference.id} href={reference.id === "jma-warnings" ? source : reference.url} target="_blank" rel="noreferrer">{reference.title} ↗</a>
      )}
    </div></details>
  </section>;
}
