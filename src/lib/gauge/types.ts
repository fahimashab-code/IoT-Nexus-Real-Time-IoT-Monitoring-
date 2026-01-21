export type Reducer = "last" | "avg" | "min" | "max" | "delta";
export type ColorMode = "thresholds" | "value" | "background";
export type Orientation = "semicircle" | "full";
export type NoDataMode = "zero" | "na" | "hold";

export type GaugeSegment = { limit: number; color: string };
export type ValueMapping = { value: number; label: string };

export interface GaugeConfig {
  min: number;
  max: number;
  unit: string;
  decimals: number;
  reducer: Reducer;
  colorMode: ColorMode;
  orientation: Orientation;
  noDataMode: NoDataMode;
  showValue: boolean;
  showLabel: boolean;
  showMinMax: boolean;
  mappings: ValueMapping[];
  segments: GaugeSegment[];
}
