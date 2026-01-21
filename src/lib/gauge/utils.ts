import type { ColorMode, GaugeConfig, GaugeSegment, NoDataMode, Reducer, ValueMapping } from "./types";

export const THRESHOLD_STEP = 0.1;

export function clampValue(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function sanitizeRange(min: number, max: number, step = THRESHOLD_STEP) {
  const safeMin = Math.min(min, max - step);
  const safeMax = Math.max(max, safeMin + step);
  return { min: safeMin, max: safeMax };
}

export function sortSegments(segments: GaugeSegment[]) {
  return [...segments].sort((a, b) => a.limit - b.limit);
}

export function normalizeSegments(
  segments: GaugeSegment[],
  min: number,
  max: number,
  step = THRESHOLD_STEP,
) {
  const sorted = sortSegments(segments);
  let lastLimit = min;

  return sorted.map((segment, index) => {
    const lowerBound = index === 0 ? min : lastLimit + step;
    const nextLimit = sorted[index + 1]?.limit ?? max;
    const upperBound =
      index === sorted.length - 1 ? max : Math.max(nextLimit - step, lowerBound);
    const clamped = Math.min(Math.max(segment.limit, lowerBound), upperBound);
    lastLimit = clamped;
    return { ...segment, limit: clamped };
  });
}

export function updateSegmentLimit(
  segments: GaugeSegment[],
  index: number,
  nextValue: number,
  min: number,
  max: number,
  step = THRESHOLD_STEP,
) {
  const sorted = sortSegments(segments);
  const lowerBound = index === 0 ? min : sorted[index - 1].limit + step;
  const upperBound =
    index === sorted.length - 1 ? max : sorted[index + 1].limit - step;
  const clamped = Math.min(Math.max(nextValue, lowerBound), Math.max(upperBound, lowerBound));
  const updated = sorted.map((segment, idx) =>
    idx === index ? { ...segment, limit: clamped } : { ...segment },
  );
  return normalizeSegments(updated, min, max, step);
}

export function updateRangeWithSegments(
  segments: GaugeSegment[],
  nextMin: number,
  nextMax: number,
  step = THRESHOLD_STEP,
) {
  const { min, max } = sanitizeRange(nextMin, nextMax, step);
  return {
    min,
    max,
    segments: normalizeSegments(segments, min, max, step),
  };
}

export function getActiveSegmentColor(
  value: number,
  min: number,
  max: number,
  segments: GaugeSegment[],
) {
  if (!segments.length) return "hsl(var(--foreground))";
  const safeValue = clampValue(value, min, max);
  const sorted = sortSegments(segments);
  const match = sorted.find((segment) => safeValue <= segment.limit);
  return match ? match.color : sorted[sorted.length - 1].color;
}

function parseHexColor(color: string) {
  const trimmed = color.replace("#", "");
  if (trimmed.length === 3) {
    const r = parseInt(trimmed[0] + trimmed[0], 16);
    const g = parseInt(trimmed[1] + trimmed[1], 16);
    const b = parseInt(trimmed[2] + trimmed[2], 16);
    return { r, g, b };
  }
  if (trimmed.length === 6) {
    const r = parseInt(trimmed.slice(0, 2), 16);
    const g = parseInt(trimmed.slice(2, 4), 16);
    const b = parseInt(trimmed.slice(4, 6), 16);
    return { r, g, b };
  }
  return { r: 148, g: 163, b: 184 };
}

function toHexChannel(value: number) {
  const safe = Math.max(0, Math.min(255, Math.round(value)));
  return safe.toString(16).padStart(2, "0");
}

function toHex({ r, g, b }: { r: number; g: number; b: number }) {
  return `#${toHexChannel(r)}${toHexChannel(g)}${toHexChannel(b)}`;
}

export function interpolateColor(start: string, end: string, ratio: number) {
  const safeRatio = Math.max(0, Math.min(1, ratio));
  const startRgb = parseHexColor(start);
  const endRgb = parseHexColor(end);
  return toHex({
    r: startRgb.r + (endRgb.r - startRgb.r) * safeRatio,
    g: startRgb.g + (endRgb.g - startRgb.g) * safeRatio,
    b: startRgb.b + (endRgb.b - startRgb.b) * safeRatio,
  });
}

export function getInterpolatedColor(
  value: number,
  min: number,
  max: number,
  segments: GaugeSegment[],
) {
  if (!segments.length) return "hsl(var(--foreground))";
  const safeValue = clampValue(value, min, max);
  const sorted = sortSegments(segments);

  for (let index = 0; index < sorted.length; index += 1) {
    const segment = sorted[index];
    if (safeValue <= segment.limit) {
      const lowerLimit = index === 0 ? min : sorted[index - 1].limit;
      const lowerColor = index === 0 ? segment.color : sorted[index - 1].color;
      const ratio =
        segment.limit === lowerLimit
          ? 1
          : (safeValue - lowerLimit) / (segment.limit - lowerLimit);
      return interpolateColor(lowerColor, segment.color, ratio);
    }
  }

  return sorted[sorted.length - 1].color;
}

export function getGaugeColor(
  mode: ColorMode,
  value: number,
  min: number,
  max: number,
  segments: GaugeSegment[],
  fallback: string,
) {
  if (mode === "background") return fallback;
  if (mode === "value") return getInterpolatedColor(value, min, max, segments);
  return getActiveSegmentColor(value, min, max, segments);
}

export function reduceSeries(values: number[], reducer: Reducer) {
  if (!values.length) return null;
  if (reducer === "last") return values[values.length - 1];
  if (reducer === "min") return Math.min(...values);
  if (reducer === "max") return Math.max(...values);
  if (reducer === "avg") return values.reduce((sum, value) => sum + value, 0) / values.length;
  if (reducer === "delta") return values[values.length - 1] - values[0];
  return values[values.length - 1];
}

export function resolveNoData(
  value: number | null,
  mode: NoDataMode,
  fallback: number | null,
) {
  if (value === null || Number.isNaN(value)) {
    if (mode === "zero") return 0;
    if (mode === "hold" && fallback !== null) return fallback;
    return null;
  }
  return value;
}

export function getMappedLabel(
  value: number | null,
  mappings: ValueMapping[],
  decimals = 2,
) {
  if (value === null || Number.isNaN(value)) return null;
  const rounded = Number(value.toFixed(decimals));
  const match = mappings.find((mapping) => mapping.value === rounded);
  return match?.label ?? null;
}

export function formatGaugeValue(value: number | null, config: GaugeConfig) {
  if (value === null || Number.isNaN(value)) {
    return "N/A";
  }
  return value.toFixed(config.decimals);
}
