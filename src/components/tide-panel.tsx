"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { japanDate, nextTide, tideDates, type TideReport } from "@/domain/tides";

const clock = (at: string) => new Date(at).toLocaleTimeString("en-GB", { timeZone: "Asia/Tokyo", hour: "2-digit", minute: "2-digit" });
const dayLabel = (date: string) => new Date(`${date}T12:00:00+09:00`).toLocaleDateString("en-GB", { timeZone: "Asia/Tokyo", weekday: "short", day: "numeric", month: "short" });

export function TidePanel({ slug }: { slug: string }) {
  const [report, setReport] = useState<TideReport | null>(null);
  const [now, setNow] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const active = useRef<AbortController | null>(null);
  const load = useCallback(async () => {
    active.current?.abort();
    const controller = new AbortController();
    active.current = controller;
    setLoading(true);
    setError("");
    setNow(Date.now());
    try {
      const response = await fetch(`/api/sites/${encodeURIComponent(slug)}/tides`, { signal: controller.signal, cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Tides unavailable");
      if (!controller.signal.aborted) { setReport(body); setNow(Date.now()); }
    } catch (error) {
      if (!controller.signal.aborted) setError(error instanceof Error ? error.message : "Tides unavailable");
    } finally { if (!controller.signal.aborted) setLoading(false); }
  }, [slug]);
  useEffect(() => {
    const initial = window.setTimeout(() => void load(), 0);
    const tick = window.setInterval(() => setNow(Date.now()), 60_000);
    const refresh = window.setInterval(() => { if (!document.hidden) void load(); }, 15 * 60_000);
    const visible = () => { if (!document.hidden) void load(); };
    document.addEventListener("visibilitychange", visible);
    return () => { clearTimeout(initial); clearInterval(tick); clearInterval(refresh); active.current?.abort(); document.removeEventListener("visibilitychange", visible); };
  }, [load]);
  const today = japanDate(now);
  const days = report?.days.filter((day) => day.date >= today) ?? [];
  const selected = days.find((day) => day.date === selectedDate) ?? days[0];
  const next = report ? nextTide(report, now) : null;
  const retrieved = report?.sources.map((source) => Date.parse(source.retrievedAt)) ?? [];
  const oldest = retrieved.length ? Math.min(...retrieved) : NaN;
  const stale = report && (!Number.isFinite(oldest) || now - oldest > 24 * 3_600_000);
  const until = next ? Math.max(0, Math.ceil((Date.parse(next.at) - now) / 60_000)) : 0;
  return <section className="tide-panel" id="tides" aria-labelledby="tides-heading" aria-busy={loading}>
    <div className="conditions-heading"><h2 id="tides-heading">Tides</h2><button onClick={() => void load()} disabled={loading}>{loading ? "Loading…" : "Refresh"}</button></div>
    <p className="tide-station">{report?.station.name ?? "Nearby station"} reference · Predicted tides · JST</p>
    {error && <p className="notice" role="alert">{error} {report ? "Showing previously retrieved predictions." : "No tide times are available right now."}</p>}
    {stale && <p className="notice">These predictions have not been refreshed in over a day. Retry before using this report.</p>}
    {!report && <p role="status">{loading ? "Fetching the daily tide table…" : "Tap Refresh to retry."}</p>}
    {report && <>
      {next && !stale && <div className="next-tide"><span>Next {next.kind} tide</span><strong>{clock(next.at)} <small>JST</small></strong><span>{dayLabel(japanDate(Date.parse(next.at)))} · in {Math.floor(until / 60)}h {until % 60}m · {next.heightM.toFixed(2)} m</span></div>}
      <div className="tide-days" aria-label="Choose tide report day">{days.map((day) => <button key={day.date} type="button" aria-pressed={selected?.date === day.date} onClick={() => setSelectedDate(day.date)}>{day.date === today ? "Today" : day.date === tideDates(now, 2)[1] ? "Tomorrow" : dayLabel(day.date)}</button>)}</div>
      {selected ? <><h3 className="tide-date">{dayLabel(selected.date)}</h3><ol className="tide-events">{selected.events.map((event) => <li key={event.at} className={Date.parse(event.at) < now ? "tide-event-past" : next?.at === event.at ? "tide-event-next" : ""}><span className="tide-kind"><span aria-hidden="true">{event.kind === "high" ? "↑" : "↓"}</span> {event.kind === "high" ? "High tide" : "Low tide"}</span><strong>{clock(event.at)}</strong><span>{event.heightM.toFixed(2)} m</span><small>{Date.parse(event.at) < now ? "Earlier today" : next?.at === event.at ? "Next tide" : "Upcoming"}</small></li>)}</ol>{!selected.events.length && <p>No high or low tide events are listed for this date.</p>}</> : <p role="status">The previous report no longer covers today. Refresh for current dates.</p>}
      <p className="small-note">Naha reference station. Heights are measured above the tide-table datum.</p>
      <details className="data-details"><summary>Sources & details</summary><p>Source: <a href={report.station.sourceUrl} target="_blank" rel="noreferrer">Japan Meteorological Agency — {report.station.name} tide table</a>. Reformatted by Ocean / Okinawa; not a JMA-produced interface.</p><p>Astronomical predictions, not observed water levels. Weather can change actual levels. No site-specific correction is applied. High/low tide does not indicate slack current or safe entry.</p><p>Retrieved {Number.isFinite(oldest) ? `${dayLabel(japanDate(oldest))}, ${clock(new Date(oldest).toISOString())} JST` : "unknown"}. Annual source checked hourly; report updates every 15 minutes while open.</p>{report.sources.map((source) => <p key={source.contentHash}><a href={source.canonicalUrl}>Annual source data</a><br /><small>SHA-256 {source.contentHash}</small></p>)}</details>
    </>}
  </section>;
}
