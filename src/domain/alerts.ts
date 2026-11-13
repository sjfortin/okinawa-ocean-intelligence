import type { SourceSnapshotMetadata } from "./provenance";

export interface WeatherAlert {
  id: string;
  title: string;
  severity: "advisory" | "warning" | "unspecified";
  reportedAt: string;
  sourceLocator: string;
}

export interface SiteAlertReport {
  alerts: WeatherAlert[];
  complete: boolean;
  source: SourceSnapshotMetadata;
}
