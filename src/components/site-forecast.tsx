"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ForecastResult } from "@/providers/types";
import { compass, forecastView } from "@/domain/forecast-view";

const time = (value: string) => new Date(value).toLocaleString("en-GB", { timeZone: "Asia/Tokyo", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
const value = (number: number | null | undefined) => number == null ? "—" : number.toFixed(1);

export function SiteForecast({ slug }: { slug: string }) {
  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState<number>(0);
  const active = useRef<AbortController | null>(null);
  const load = useCallback(async () => {
    active.current?.abort();
    const controller = new AbortController();
    active.current = controller;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/sites/${encodeURIComponent(slug)}/forecast`, { signal: controller.signal, cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Forecast unavailable");
      if (!controller.signal.aborted) { setForecast(result); setNow(Date.now()); }
    } catch (error) {
      if (!controller.signal.aborted) setError(error instanceof Error ? error.message : "Forecast unavailable");
    } finally { if (!controller.signal.aborted) setLoading(false); }
  }, [slug]);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void load(), 0);
    const tick = window.setInterval(() => setNow(Date.now()), 30_000);
    const refresh = window.setInterval(() => { if (!document.hidden) void load(); }, 10 * 60_000);
    const onVisible = () => { if (!document.hidden) { setNow(Date.now()); void load(); } };
    document.addEventListener("visibilitychange", onVisible);
    return () => { clearTimeout(initialLoad); active.current?.abort(); clearInterval(tick); clearInterval(refresh); document.removeEventListener("visibilitychange", onVisible); };
  }, [load]);

  const view = forecastView(forecast, now);
  const hour = view.current;
  const status = error ? "Refresh failed" : loading && !forecast ? "Loading…" : view.stale ? "Data unavailable or stale" : !hour ? "Current hour unavailable" : `${time(hour.validAt)} JST · Model estimate`;
  return <section className="forecast-panel" aria-label="Water and weather forecast" aria-busy={loading}>
    <div className="conditions-heading"><div><h2>Right now</h2><p className="timestamp" role="status">{status}</p></div><button onClick={() => void load()} disabled={loading}>{loading ? "Updating…" : "Refresh"}</button></div>
    {error && <p className="notice" role="alert">{error} {forecast ? "Showing the last retrieved forecast below." : "Use the official references below while the forecast is unavailable."}</p>}
    <div className="metric-grid">
      <Metric label="Waves" number={hour?.waveHeightM} unit="m" detail={`${value(hour?.wavePeriodS)} s period · from ${compass(hour?.waveDirectionDeg)}`} />
      <Metric label="Wind" number={hour?.windSpeedKph} unit="km/h" detail={`From ${compass(hour?.windDirectionDeg)} · gusts ${value(hour?.windGustKph)} km/h`} />
      <Metric label="Water" number={hour?.seaSurfaceTemperatureC} unit="°C" detail="Surface temperature" />
      <Metric label="Air" number={hour?.airTemperatureC} unit="°C" detail={`Rain ${value(hour?.precipitationMm)} mm`} />
    </div>
    <p className="small-note model-note">Regional forecast · Conditions at the seawall may differ. — means unavailable.</p>
    <section className="near-outlook" aria-labelledby="near-outlook-heading">
      <h3 id="near-outlook-heading">Next few hours</h3>
      {view.upcoming.length ? <div className="outlook-scroll" tabIndex={0} role="region" aria-label="Next six hours, scroll horizontally">
        <table className="outlook-table">
          <thead><tr><th scope="col">JST</th>{view.upcoming.slice(0, 6).map((h) => <th scope="col" key={h.validAt}>{new Date(h.validAt).toLocaleTimeString("en-GB", { timeZone: "Asia/Tokyo", hour: "2-digit", minute: "2-digit" })}</th>)}</tr></thead>
          <tbody>
            <tr><th scope="row">Waves</th>{view.upcoming.slice(0, 6).map((h) => <td key={h.validAt}>{value(h.waveHeightM)} <small>m</small></td>)}</tr>
            <tr><th scope="row">Wind</th>{view.upcoming.slice(0, 6).map((h) => <td key={h.validAt}>{value(h.windSpeedKph)} <small>km/h</small><small className="outlook-direction">{compass(h.windDirectionDeg)}</small></td>)}</tr>
          </tbody>
        </table>
      </div> : <p className="small-note">{loading ? "Loading outlook…" : "Upcoming hours unavailable."}</p>}
    </section>
    <details className="hourly-details"><summary>Next 24 hours <span className="summary-note">Hourly forecast · JST</span></summary>
    {view.upcoming.length ? <div className="forecast-scroll" tabIndex={0} role="region" aria-label="Hourly outlook, scroll horizontally"><table>
      <caption>Hourly forecast · times in JST</caption>
      <thead><tr>{["Time", "Waves / period", "Wind / gusts", "Swell", "Water", "Rain"].map((label) => <th scope="col" key={label}>{label}</th>)}</tr></thead>
      <tbody>{view.upcoming.map((h) => <tr key={h.validAt}><th scope="row">{time(h.validAt)}</th><td>{value(h.waveHeightM)} m <small>/ {value(h.wavePeriodS)} s</small></td><td>{value(h.windSpeedKph)} <small>/ {value(h.windGustKph)} km/h · {compass(h.windDirectionDeg)}</small></td><td>{value(h.swellHeightM)} m</td><td>{value(h.seaSurfaceTemperatureC)} °C</td><td>{value(h.precipitationMm)} mm</td></tr>)}</tbody>
    </table></div> : <div className="empty-state">{loading ? "Loading the hourly outlook…" : "No upcoming forecast hours available. Try refreshing."}</div>}
    </details>
    <details>
      <summary>Past 24 hours <span className="summary-note">Waves & wind · JST</span></summary>
      <p className="small-note">Archived regional model estimates from Open-Meteo. Times are in Japan time, most recent first.</p>
      {view.recent.length ? <div className="forecast-scroll" tabIndex={0} role="region" aria-label="Recent wave and wind estimates">
        <table>
          <thead><tr><th scope="col">Time</th><th scope="col">Waves</th><th scope="col">Wind</th><th scope="col">Gusts</th></tr></thead>
          <tbody>{view.recent.map((h) => <tr key={h.validAt}>
            <th scope="row">{time(h.validAt)}</th>
            <td>{value(h.waveHeightM)} m <small>· {value(h.wavePeriodS)} s · from {compass(h.waveDirectionDeg)}</small></td>
            <td>{value(h.windSpeedKph)} km/h <small>· from {compass(h.windDirectionDeg)}</small></td>
            <td>{value(h.windGustKph)} km/h</td>
          </tr>)}</tbody>
        </table>
      </div> : <div className="empty-state">{loading ? "Loading recent estimates…" : "No recent wave or wind estimates available."}</div>}
    </details>
    {forecast && <details className="data-details"><summary>More conditions & sources</summary>
      <p>Swell {value(hour?.swellHeightM)} m · from {compass(hour?.swellDirectionDeg)}. Offshore current {value(hour?.oceanCurrentVelocityKph)} km/h.</p>
      <p>{view.retrievedAt && `Retrieved ${time(view.retrievedAt)} JST.`}</p>
      <p>Weather by <a href="https://open-meteo.com/">Open-Meteo</a>; marine data by <a href="https://www.dwd.de/">DWD</a> and <a href="https://open-meteo.com/en/docs/marine-weather-api">Open-Meteo Marine</a>. Refreshes every 10 minutes. Retrieval time is not the model issue time.</p>
      {forecast.warnings.map((warning) => <p key={warning}>{warning}</p>)}
      <p>Underwater visibility, breaking surf, local rip currents and access closures are not measured here. Sea-level model output is not used as a local tide table.</p>
      {forecast.metadata.map((run) => <p key={run.runId}>{run.provider} · grid {run.gridLocation.latitude}, {run.gridLocation.longitude} · retrieved {time(run.responseReceivedAt)} JST<br /><small>Run {run.runId} · SHA-256 {run.responseHash}</small></p>)}
    </details>}
  </section>;
}

function Metric({ label, number, unit, detail }: { label: string; number: number | null | undefined; unit: string; detail: string }) {
  return <div className="metric"><p>{label}</p><div className="metric-value">{value(number)} <span>{unit}</span></div><small>{detail}</small></div>;
}
