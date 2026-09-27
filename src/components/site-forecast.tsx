"use client";

import { useState } from "react";
import type { ForecastResult } from "@/providers/types";

const time = (value: string) => new Date(value).toLocaleString("en-GB", { timeZone: "Asia/Tokyo", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
const value = (number: number | null) => number === null ? "Unavailable" : number.toFixed(1);

export function SiteForecast({ slug }: { slug: string }) {
  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function load() {
    setLoading(true);
    setError("");
    setForecast(null);
    try {
      const response = await fetch(`/api/sites/${slug}/forecast`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Forecast unavailable");
      setForecast(result);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Forecast unavailable");
    } finally { setLoading(false); }
  }
  const fetchedAt = forecast?.metadata[0]?.responseReceivedAt;
  const hours = fetchedAt ? forecast!.hours.filter((hour) => Date.parse(hour.validAt) >= Date.parse(fetchedAt) - 3600000).slice(0, 24) : [];
  return <section className="forecast-panel" aria-busy={loading}>
    <button onClick={load} disabled={loading}>{loading ? "Loading forecast…" : forecast ? "Refresh forecast" : "Load forecast preview"}</button>
    <p role="status">{error || (loading ? "Requesting weather and marine forecasts…" : "")}</p>
    {forecast && <>
      <p>Next 24 forecast hours · Japan time (JST). Retrieved {time(forecast.metadata[0].responseReceivedAt)} JST.</p>
      <p>Forecast model values; waves offshore can differ from conditions at the entry. Atmospheric visibility is not underwater visibility.</p>
      {hours.length ? <div className="forecast-scroll" tabIndex={0} role="region" aria-label="Hourly forecast table"><table>
        <caption>Weather and marine forecast · missing values remain unavailable</caption>
        <thead><tr>{["Time (JST)", "Wind km/h", "Gust km/h", "Wave m", "Swell m", "Air °C", "Sea °C", "Rain mm"].map((label) => <th scope="col" key={label}>{label}</th>)}</tr></thead>
        <tbody>{hours.map((hour) => <tr key={hour.validAt}><th scope="row">{time(hour.validAt)}</th>{[hour.windSpeedKph, hour.windGustKph, hour.waveHeightM, hour.swellHeightM, hour.airTemperatureC, hour.seaSurfaceTemperatureC, hour.precipitationMm].map((number, index) => <td key={index}>{value(number)}</td>)}</tr>)}</tbody>
      </table></div> : <p>No upcoming hours are available.</p>}
      {forecast.warnings.map((warning) => <p className="notice" key={warning}>{warning}</p>)}
      <p>Weather data by <a href="https://open-meteo.com/">Open-Meteo</a>; marine attribution: <a href="https://www.dwd.de/">DWD</a> and <a href="https://open-meteo.com/en/docs/marine-weather-api">Open-Meteo Marine</a>.</p>
    </>}
  </section>;
}
