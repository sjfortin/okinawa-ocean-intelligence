import type { NormalizedConditions } from "@/domain/conditions";

export interface ForecastRequest {
  latitude: number;
  longitude: number;
  timezone?: string;
  forecastDays?: number;
}

export interface ProviderMetadata {
  provider: string;
  runId: string;
  requestedAt: string;
  responseReceivedAt: string;
  endpoint: string;
  requestParameters: Record<string, string>;
  responseHash: string;
  requestedLocation: { latitude: number; longitude: number };
  gridLocation: { latitude: number; longitude: number };
}

export interface ForecastResult {
  metadata: ProviderMetadata[];
  hours: NormalizedConditions[];
  warnings: string[];
}

export interface ConditionsProvider {
  readonly name: string;
  getForecast(request: ForecastRequest): Promise<ForecastResult>;
}
