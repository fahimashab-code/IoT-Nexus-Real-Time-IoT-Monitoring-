"use client";

import { Activity } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Sample } from "@/lib/bench-model";

export type Metric = "speed" | "current" | "temperature" | "vibration";
export const METRICS: Record<Metric, { label: string; unit: string; color: string }> = {
  speed: { label: "Motor speed", unit: "RPM", color: "#ea6c35" },
  current: { label: "Current", unit: "A", color: "#367cb2" },
  temperature: { label: "Temperature", unit: "°C", color: "#ba8340" },
  vibration: { label: "Vibration", unit: "mm/s", color: "#7c68aa" },
};

export function TelemetryChart({
  samples,
  metric = "speed",
  maxRpm = 3000,
}: {
  samples: Sample[];
  metric?: Metric;
  maxRpm?: number;
}) {
  if (!samples.length) {
    return (
      <div className="chart-empty">
        <span className="empty-chart-icon">
          <Activity size={25} strokeWidth={1.5} />
        </span>
        <strong>Your next experiment starts here</strong>
        <p>Run the demo to see the motor response over time.</p>
        <span className="empty-chart-axis">TIME / SECONDS</span>
      </div>
    );
  }
  const selected = METRICS[metric];
  return (
    <div
      className="chart-container"
      role="img"
      aria-label={`${selected.label} over time. Simulated measurements, ${samples.length} samples.`}
    >
      <ResponsiveContainer
        width="100%"
        height="100%"
        minWidth={0}
        initialDimension={{ width: 640, height: 245 }}
      >
        <LineChart
          data={samples}
          margin={{ top: 12, right: 12, bottom: 3, left: -15 }}
          accessibilityLayer
        >
          <CartesianGrid stroke="#e9edf0" vertical={false} strokeDasharray="3 4" />
          <XAxis
            dataKey="time"
            type="number"
            domain={[samples[0].time < 1 ? 0 : "dataMin", "dataMax"]}
            tickLine={false}
            axisLine={false}
            minTickGap={35}
            tick={{ fill: "#89939d", fontSize: 11 }}
            tickFormatter={(value: number) => `${value}s`}
          />
          <YAxis
            domain={metric === "speed" ? [0, maxRpm] : [0, "auto"]}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#89939d", fontSize: 11 }}
            width={66}
          />
          <Tooltip
            labelFormatter={(value) => `${value} seconds · simulated`}
            contentStyle={{
              border: "1px solid #e4e8eb",
              borderRadius: 10,
              boxShadow: "0 6px 25px #1c293512",
              fontSize: 12,
            }}
          />
          {metric === "speed" && (
            <Line
              name="Requested speed (RPM)"
              type="linear"
              dataKey="target"
              stroke="#a5adb6"
              strokeDasharray="6 5"
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
          )}
          <Line
            name={`${selected.label} (${selected.unit})`}
            type="monotone"
            dataKey={metric}
            stroke={selected.color}
            strokeWidth={2.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
