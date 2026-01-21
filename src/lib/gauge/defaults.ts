import type { GaugeConfig, GaugeSegment } from "./types";

export const DEFAULT_GAUGE_CONFIG: GaugeConfig = {
  min: 0,
  max: 100,
  unit: "",
  decimals: 1,
  reducer: "last",
  colorMode: "thresholds",
  orientation: "semicircle",
  noDataMode: "hold",
  showValue: true,
  showLabel: false,
  showMinMax: false,
  mappings: [],
  segments: [],
};

export function createGaugeConfig({
  min,
  max,
  unit,
  segments,
  ...rest
}: Partial<GaugeConfig> & { min: number; max: number; unit: string; segments: GaugeSegment[] }) {
  return {
    ...DEFAULT_GAUGE_CONFIG,
    min,
    max,
    unit,
    segments: segments.map((segment) => ({ ...segment })),
    ...rest,
  } satisfies GaugeConfig;
}
