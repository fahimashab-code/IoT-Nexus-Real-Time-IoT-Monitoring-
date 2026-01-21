"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, ArrowUpRight, Gauge as GaugeIcon, Thermometer, Zap } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, MetricGauge } from "@/components/dashboard/MetricGaugeCard";
import { createGaugeConfig } from "@/lib/gauge/defaults";
import type {
  ColorMode,
  GaugeConfig,
  GaugeSegment,
  NoDataMode,
  Orientation,
  Reducer,
} from "@/lib/gauge/types";
import {
  THRESHOLD_STEP,
  clampValue,
  getMappedLabel,
  reduceSeries,
  resolveNoData,
  updateRangeWithSegments,
  updateSegmentLimit,
} from "@/lib/gauge/utils";

interface DeviceTelemetryChartProps {
  deviceId: string;
  compact?: boolean;
}

type MetricKey = "temperature" | "pressure" | "power" | "current";
type PollRate = 5000 | 10000 | 60000;

interface MetricConfig {
  metricKey: MetricKey;
  label: string;
  unit: string;
  min: number;
  max: number;
  color: string;
  icon: typeof Thermometer;
  segments: GaugeSegment[];
}

interface TelemetryPoint {
  timestamp: string;
  temperature: number;
  pressure: number;
  power: number;
  current: number;
}

const metrics: MetricConfig[] = [
  {
    metricKey: "temperature",
    label: "Temperature",
    unit: "C",
    min: 0,
    max: 100,
    color: "#10b981",
    icon: Thermometer,
    segments: [
      { limit: 40, color: "#10b981" },
      { limit: 60, color: "#fbbf24" },
      { limit: 80, color: "#f59e0b" },
      { limit: 100, color: "#ef4444" },
    ],
  },
  {
    metricKey: "pressure",
    label: "Pressure",
    unit: "kPa",
    min: 80,
    max: 120,
    color: "#38bdf8",
    icon: GaugeIcon,
    segments: [
      { limit: 95, color: "#22c55e" },
      { limit: 105, color: "#fbbf24" },
      { limit: 112, color: "#f59e0b" },
      { limit: 120, color: "#ef4444" },
    ],
  },
  {
    metricKey: "power",
    label: "Power Usage",
    unit: "W",
    min: 0,
    max: 800,
    color: "#3b82f6",
    icon: Zap,
    segments: [
      { limit: 300, color: "#10b981" },
      { limit: 500, color: "#3b82f6" },
      { limit: 650, color: "#f59e0b" },
      { limit: 800, color: "#ef4444" },
    ],
  },
  {
    metricKey: "current",
    label: "Current",
    unit: "A",
    min: 0,
    max: 20,
    color: "#a855f7",
    icon: Activity,
    segments: [
      { limit: 8, color: "#10b981" },
      { limit: 12, color: "#3b82f6" },
      { limit: 16, color: "#f59e0b" },
      { limit: 20, color: "#ef4444" },
    ],
  },
];

const metricsByKey = metrics.reduce<Record<MetricKey, MetricConfig>>((acc, metric) => {
  acc[metric.metricKey] = metric;
  return acc;
}, {} as Record<MetricKey, MetricConfig>);

const initialGaugeConfig = metrics.reduce<Record<MetricKey, GaugeConfig>>((acc, metric) => {
  acc[metric.metricKey] = createGaugeConfig({
    min: metric.min,
    max: metric.max,
    unit: metric.unit,
    segments: metric.segments,
    colorMode: "thresholds",
    reducer: "last",
    orientation: "semicircle",
    noDataMode: "hold",
    showValue: true,
    showLabel: false,
    showMinMax: false,
    decimals: 1,
  });
  return acc;
}, {} as Record<MetricKey, GaugeConfig>);

const visibleMetrics = metrics.slice(0, 2);

const reducerOptions: { value: Reducer; label: string; description: string }[] = [
  { value: "last", label: "Last", description: "Use the latest data point." },
  { value: "avg", label: "Average", description: "Average across the window." },
  { value: "min", label: "Min", description: "Use the minimum value." },
  { value: "max", label: "Max", description: "Use the maximum value." },
  { value: "delta", label: "Delta", description: "Last minus first value." },
];

const colorModeOptions: { value: ColorMode; label: string }[] = [
  { value: "thresholds", label: "Thresholds" },
  { value: "value", label: "Value Gradient" },
  { value: "background", label: "Neutral" },
];

const orientationOptions: { value: Orientation; label: string }[] = [
  { value: "semicircle", label: "Semicircle" },
  { value: "full", label: "Full Circle" },
];

const noDataOptions: { value: NoDataMode; label: string }[] = [
  { value: "hold", label: "Hold last" },
  { value: "zero", label: "Zero" },
  { value: "na", label: "Show N/A" },
];

export function DeviceTelemetryChart({ deviceId, compact = false }: DeviceTelemetryChartProps) {
  const [data, setData] = useState<TelemetryPoint[]>([]);
  const [activeTab, setActiveTab] = useState<MetricKey>("temperature");
  const [pollRate, setPollRate] = useState<PollRate>(10000);
  const [gaugeConfig, setGaugeConfig] =
    useState<Record<MetricKey, GaugeConfig>>(initialGaugeConfig);
  const [lastGoodValues, setLastGoodValues] = useState<Record<MetricKey, number | null>>(() => {
    return metrics.reduce((acc, metric) => {
      acc[metric.metricKey] = null;
      return acc;
    }, {} as Record<MetricKey, number | null>);
  });
  const [editMetricKey, setEditMetricKey] = useState<MetricKey | null>(null);

  const buildPoint = (timestamp: Date, index: number): TelemetryPoint => {
    const base = index / 6;
    return {
      timestamp: timestamp.toISOString(),
      temperature: 48 + Math.sin(base) * 8 + (index % 5) * 0.8,
      pressure: 98 + Math.cos(base / 1.2) * 6 + (index % 4) * 0.6,
      power: 420 + Math.sin(base / 1.4) * 80 + (index % 6) * 6,
      current: 10 + Math.cos(base / 1.6) * 3 + (index % 5) * 0.4,
    };
  };

  const buildInitialSeries = (points: number, intervalMs: number) => {
    const start = Date.now() - points * intervalMs;
    return Array.from({ length: points }, (_, index) =>
      buildPoint(new Date(start + index * intervalMs), index),
    );
  };

  const updateGaugeConfig = (metricKey: MetricKey, next: Partial<GaugeConfig>) => {
    setGaugeConfig((prev) => ({
      ...prev,
      [metricKey]: { ...prev[metricKey], ...next },
    }));
  };

  const updateSegmentColor = (metricKey: MetricKey, index: number, nextColor: string) => {
    setGaugeConfig((prev) => {
      const config = prev[metricKey];
      const segments = config.segments.map((segment, idx) =>
        idx === index ? { ...segment, color: nextColor } : { ...segment },
      );
      return { ...prev, [metricKey]: { ...config, segments } };
    });
  };

  const handleSegmentLimitChange = (metricKey: MetricKey, index: number, nextValue: number) => {
    setGaugeConfig((prev) => {
      const config = prev[metricKey];
      const updatedSegments = updateSegmentLimit(
        config.segments,
        index,
        nextValue,
        config.min,
        config.max,
        THRESHOLD_STEP,
      );
      return { ...prev, [metricKey]: { ...config, segments: updatedSegments } };
    });
  };

  const handleRangeChange = (metricKey: MetricKey, nextMin: number, nextMax: number) => {
    setGaugeConfig((prev) => {
      const config = prev[metricKey];
      const updated = updateRangeWithSegments(
        config.segments,
        nextMin,
        nextMax,
        THRESHOLD_STEP,
      );
      return {
        ...prev,
        [metricKey]: { ...config, min: updated.min, max: updated.max, segments: updated.segments },
      };
    });
  };

  const resetSegments = (metricKey: MetricKey) => {
    const metric = metricsByKey[metricKey];
    setGaugeConfig((prev) => ({
      ...prev,
      [metricKey]: createGaugeConfig({
        min: metric.min,
        max: metric.max,
        unit: metric.unit,
        segments: metric.segments,
        colorMode: prev[metricKey].colorMode,
        reducer: prev[metricKey].reducer,
        orientation: prev[metricKey].orientation,
        noDataMode: prev[metricKey].noDataMode,
        showValue: prev[metricKey].showValue,
        showLabel: prev[metricKey].showLabel,
        showMinMax: prev[metricKey].showMinMax,
        decimals: prev[metricKey].decimals,
        mappings: prev[metricKey].mappings,
      }),
    }));
  };

  const addMapping = (metricKey: MetricKey) => {
    setGaugeConfig((prev) => {
      const config = prev[metricKey];
      const mappings = [...config.mappings, { value: 0, label: "" }];
      return { ...prev, [metricKey]: { ...config, mappings } };
    });
  };

  const updateMappingValue = (metricKey: MetricKey, index: number, nextValue: number) => {
    setGaugeConfig((prev) => {
      const config = prev[metricKey];
      const mappings = config.mappings.map((mapping, idx) =>
        idx === index ? { ...mapping, value: nextValue } : { ...mapping },
      );
      return { ...prev, [metricKey]: { ...config, mappings } };
    });
  };

  const updateMappingLabel = (metricKey: MetricKey, index: number, nextLabel: string) => {
    setGaugeConfig((prev) => {
      const config = prev[metricKey];
      const mappings = config.mappings.map((mapping, idx) =>
        idx === index ? { ...mapping, label: nextLabel } : { ...mapping },
      );
      return { ...prev, [metricKey]: { ...config, mappings } };
    });
  };

  const removeMapping = (metricKey: MetricKey, index: number) => {
    setGaugeConfig((prev) => {
      const config = prev[metricKey];
      const mappings = config.mappings.filter((_, idx) => idx !== index);
      return { ...prev, [metricKey]: { ...config, mappings } };
    });
  };

  useEffect(() => {
    setData(buildInitialSeries(30, pollRate));
  }, [deviceId, pollRate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => {
        const now = new Date();
        const newPoint = buildPoint(now, prev.length);
        const newData = [...prev, newPoint];
        return newData.slice(-30);
      });
    }, pollRate);
    return () => clearInterval(interval);
  }, [deviceId, pollRate]);

  const currentValues = useMemo(() => {
    return metrics.reduce<Record<MetricKey, number | null>>((acc, metric) => {
      const config = gaugeConfig[metric.metricKey];
      const values = data.map((point) => point[metric.metricKey]);
      acc[metric.metricKey] = reduceSeries(values, config.reducer);
      return acc;
    }, {} as Record<MetricKey, number | null>);
  }, [data, gaugeConfig]);

  useEffect(() => {
    setLastGoodValues((prev) => {
      let changed = false;
      const next = { ...prev };
      metrics.forEach((metric) => {
        const value = currentValues[metric.metricKey];
        if (value !== null && !Number.isNaN(value) && value !== prev[metric.metricKey]) {
          next[metric.metricKey] = value;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [currentValues]);

  const activeMetric = useMemo(
    () =>
      visibleMetrics.find((metric) => metric.metricKey === activeTab) ??
      visibleMetrics[0],
    [activeTab],
  );

  const gradientId = `metric-gradient-${activeMetric.metricKey}`;
  const editMetric = editMetricKey ? metricsByKey[editMetricKey] : null;
  const editConfig = editMetricKey ? gaugeConfig[editMetricKey] : null;

  return (
    <div className="space-y-6">
      <div
        className={`grid gap-6 ${
          compact ? "sm:grid-cols-2" : "sm:grid-cols-2 xl:grid-cols-4"
        }`}
      >
        {visibleMetrics.map((metric) => {
          const config = gaugeConfig[metric.metricKey];
          const rawValue = currentValues[metric.metricKey] ?? null;
          const resolvedValue = resolveNoData(rawValue, config.noDataMode, lastGoodValues[metric.metricKey]);
          const isAvailable = resolvedValue !== null && !Number.isNaN(resolvedValue);
          const plotValue = clampValue(resolvedValue ?? config.min, config.min, config.max);
          const mappedLabel = getMappedLabel(resolvedValue, config.mappings, config.decimals);
          return (
            <MetricGauge
              key={metric.metricKey}
              metric={metric}
              config={config}
              displayValue={resolvedValue}
              plotValue={plotValue}
              mappedLabel={mappedLabel}
              isAvailable={isAvailable}
              onEdit={() => setEditMetricKey(metric.metricKey)}
            />
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ArrowUpRight size={18} className="text-blue-500" />
            <CardTitle>Historical Trends</CardTitle>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-2 rounded-lg border border-border/60 bg-muted/30 p-1">
              {visibleMetrics.map((metric) => (
                <button
                  key={metric.metricKey}
                  onClick={() => setActiveTab(metric.metricKey)}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                    activeTab === metric.metricKey
                      ? "bg-muted text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {metric.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-2 py-1 text-xs text-muted-foreground">
              <span className="uppercase tracking-[0.2em]">Polling</span>
              <select
                value={pollRate}
                onChange={(event) => setPollRate(Number(event.target.value) as PollRate)}
                className="rounded-md border border-border/60 bg-background px-2 py-1 text-xs text-foreground"
              >
                <option value={5000}>5s</option>
                <option value={10000}>10s</option>
                <option value={60000}>1m</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mt-4 h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={activeMetric.color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={activeMetric.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(value) =>
                    new Date(value).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })
                  }
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 11 }}
                  tickMargin={10}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    borderColor: "hsl(var(--border))",
                    color: "hsl(var(--foreground))",
                  }}
                  itemStyle={{ color: "hsl(var(--foreground))" }}
                  labelStyle={{ color: "hsl(var(--muted-foreground))", marginBottom: "0.5rem" }}
                  labelFormatter={(label) => new Date(label as string).toLocaleTimeString()}
                />
                <Area
                  type="monotone"
                  dataKey={activeMetric.metricKey}
                  stroke={activeMetric.color}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill={`url(#${gradientId})`}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      <Dialog open={Boolean(editMetric)} onOpenChange={(open) => !open && setEditMetricKey(null)}>
        <DialogContent className="max-h-[80vh] max-w-xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gauge Settings</DialogTitle>
            <DialogDescription>
              Grafana-style steps: each color is an upper bound. Values take the first color
              where value is less than or equal to the limit.
            </DialogDescription>
          </DialogHeader>
          {editMetric && editConfig ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{editMetric.label}</span>
                <span className="text-xs text-muted-foreground">
                  {editConfig.min} - {editConfig.max} {editConfig.unit}
                </span>
              </div>

              <div className="grid gap-3 rounded-lg border border-border/60 bg-muted/10 p-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Range
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-md border border-border/60 bg-background p-2">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      Min
                    </p>
                    <input
                      type="number"
                      value={editConfig.min}
                      step={THRESHOLD_STEP}
                      onChange={(event) =>
                        handleRangeChange(
                          editMetric.metricKey,
                          Number(event.target.value),
                          editConfig.max,
                        )
                      }
                      className="mt-2 h-8 w-full rounded-md border border-border/60 bg-background px-2 text-xs text-foreground"
                    />
                  </div>
                  <div className="rounded-md border border-border/60 bg-background p-2">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      Max
                    </p>
                    <input
                      type="number"
                      value={editConfig.max}
                      step={THRESHOLD_STEP}
                      onChange={(event) =>
                        handleRangeChange(
                          editMetric.metricKey,
                          editConfig.min,
                          Number(event.target.value),
                        )
                      }
                      className="mt-2 h-8 w-full rounded-md border border-border/60 bg-background px-2 text-xs text-foreground"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  <span>Thresholds</span>
                  <span>Upper limit</span>
                </div>
                {editConfig.segments.map((segment, index) => {
                  const rangeStart =
                    index === 0 ? editConfig.min : editConfig.segments[index - 1].limit;
                  const rangeEnd = segment.limit;
                  return (
                    <div
                      key={`${editMetric.metricKey}-${index}`}
                      className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-md border border-border/60 bg-muted/20 p-2"
                    >
                      <div className="flex items-center gap-2 text-xs">
                        <input
                          type="color"
                          value={segment.color}
                          onChange={(event) =>
                            updateSegmentColor(editMetric.metricKey, index, event.target.value)
                          }
                          className="h-7 w-7 cursor-pointer rounded-md border border-border/60 bg-transparent"
                        />
                        <span className="font-mono">
                          {rangeStart.toFixed(1)} - {rangeEnd.toFixed(1)} {editConfig.unit}
                        </span>
                      </div>
                      <input
                        type="number"
                        value={segment.limit}
                        min={editConfig.min}
                        max={editConfig.max}
                        step={THRESHOLD_STEP}
                        onChange={(event) =>
                          handleSegmentLimitChange(
                            editMetric.metricKey,
                            index,
                            Number(event.target.value),
                          )
                        }
                        className="h-8 w-24 rounded-md border border-border/60 bg-background px-2 text-xs text-foreground"
                      />
                    </div>
                  );
                })}
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-border/60 bg-muted/10 p-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Aggregation
                  </p>
                  <select
                    value={editConfig.reducer}
                    onChange={(event) =>
                      updateGaugeConfig(editMetric.metricKey, {
                        reducer: event.target.value as Reducer,
                      })
                    }
                    className="mt-2 h-9 w-full rounded-md border border-border/60 bg-background px-2 text-xs text-foreground"
                  >
                    {reducerOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {reducerOptions.find((option) => option.value === editConfig.reducer)?.description}
                  </p>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/10 p-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Color mode
                  </p>
                  <select
                    value={editConfig.colorMode}
                    onChange={(event) =>
                      updateGaugeConfig(editMetric.metricKey, {
                        colorMode: event.target.value as ColorMode,
                      })
                    }
                    className="mt-2 h-9 w-full rounded-md border border-border/60 bg-background px-2 text-xs text-foreground"
                  >
                    {colorModeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/10 p-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Orientation
                  </p>
                  <select
                    value={editConfig.orientation}
                    onChange={(event) =>
                      updateGaugeConfig(editMetric.metricKey, {
                        orientation: event.target.value as Orientation,
                      })
                    }
                    className="mt-2 h-9 w-full rounded-md border border-border/60 bg-background px-2 text-xs text-foreground"
                  >
                    {orientationOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/10 p-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    No data
                  </p>
                  <select
                    value={editConfig.noDataMode}
                    onChange={(event) =>
                      updateGaugeConfig(editMetric.metricKey, {
                        noDataMode: event.target.value as NoDataMode,
                      })
                    }
                    className="mt-2 h-9 w-full rounded-md border border-border/60 bg-background px-2 text-xs text-foreground"
                  >
                    {noDataOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-border/60 bg-muted/10 p-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Format
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        Unit
                      </label>
                      <input
                        type="text"
                        value={editConfig.unit}
                        onChange={(event) =>
                          updateGaugeConfig(editMetric.metricKey, { unit: event.target.value })
                        }
                        className="mt-1 h-8 w-full rounded-md border border-border/60 bg-background px-2 text-xs text-foreground"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        Decimals
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={4}
                        value={editConfig.decimals}
                        onChange={(event) =>
                          updateGaugeConfig(editMetric.metricKey, {
                            decimals: Number(event.target.value),
                          })
                        }
                        className="mt-1 h-8 w-full rounded-md border border-border/60 bg-background px-2 text-xs text-foreground"
                      />
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/10 p-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Display
                  </p>
                  <div className="mt-2 grid gap-2 text-xs">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editConfig.showValue}
                        onChange={(event) =>
                          updateGaugeConfig(editMetric.metricKey, {
                            showValue: event.target.checked,
                          })
                        }
                      />
                      Show value
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editConfig.showLabel}
                        onChange={(event) =>
                          updateGaugeConfig(editMetric.metricKey, {
                            showLabel: event.target.checked,
                          })
                        }
                      />
                      Show label
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editConfig.showMinMax}
                        onChange={(event) =>
                          updateGaugeConfig(editMetric.metricKey, {
                            showMinMax: event.target.checked,
                          })
                        }
                      />
                      Show min/max
                    </label>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border/60 bg-muted/10 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Value mappings
                  </p>
                  <button
                    type="button"
                    onClick={() => addMapping(editMetric.metricKey)}
                    className="rounded-md border border-border/60 px-2 py-1 text-xs text-foreground transition hover:bg-muted"
                  >
                    Add mapping
                  </button>
                </div>
                <div className="mt-3 space-y-2">
                  {editConfig.mappings.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No mappings configured.</p>
                  ) : null}
                  {editConfig.mappings.map((mapping, index) => (
                    <div
                      key={`${editMetric.metricKey}-mapping-${index}`}
                      className="grid grid-cols-[100px_1fr_auto] items-center gap-2"
                    >
                      <input
                        type="number"
                        value={mapping.value}
                        onChange={(event) =>
                          updateMappingValue(
                            editMetric.metricKey,
                            index,
                            Number(event.target.value),
                          )
                        }
                        className="h-8 rounded-md border border-border/60 bg-background px-2 text-xs text-foreground"
                      />
                      <input
                        type="text"
                        value={mapping.label}
                        onChange={(event) =>
                          updateMappingLabel(editMetric.metricKey, index, event.target.value)
                        }
                        className="h-8 rounded-md border border-border/60 bg-background px-2 text-xs text-foreground"
                        placeholder="Label"
                      />
                      <button
                        type="button"
                        onClick={() => removeMapping(editMetric.metricKey, index)}
                        className="rounded-md border border-border/60 px-2 py-1 text-xs text-foreground transition hover:bg-muted"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                <span>Limits must stay ascending</span>
                <button
                  type="button"
                  onClick={() => resetSegments(editMetric.metricKey)}
                  className="rounded-md border border-border/60 px-2 py-1 text-xs text-foreground transition hover:bg-muted"
                >
                  Reset defaults
                </button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
