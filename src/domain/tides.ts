import type { SourceSnapshotMetadata } from "./provenance";

export interface TideStation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  sourceUrl: string;
  datum: string;
}
export interface TideEvent {
  kind: "high" | "low";
  at: string;
  heightM: number;
}
export interface TideDay {
  date: string; // calendar date in Asia/Tokyo
  events: TideEvent[];
  sourceHash: string;
  sourceLocator: string;
}
export interface TideReport {
  station: TideStation;
  timezone: "Asia/Tokyo";
  kind: "astronomical_prediction";
  days: TideDay[];
  sources: SourceSnapshotMetadata[];
}
export function japanDate(now: number): string {
  return new Date(now + 9 * 3_600_000).toISOString().slice(0, 10);
}
export function tideDates(now: number, count = 3): string[] {
  return Array.from({ length: count }, (_, offset) => japanDate(now + offset * 86_400_000));
}
export function nextTide(report: TideReport, now: number) {
  return report.days.flatMap((day) => day.events).filter((event) => Date.parse(event.at) >= now)
    .sort((a, b) => Date.parse(a.at) - Date.parse(b.at))[0] ?? null;
}
