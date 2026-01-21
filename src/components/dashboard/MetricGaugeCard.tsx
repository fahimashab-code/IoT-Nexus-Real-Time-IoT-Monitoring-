"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { GaugeConfig, GaugeSegment, Orientation } from "@/lib/gauge/types";
import { clampValue, formatGaugeValue, getGaugeColor } from "@/lib/gauge/utils";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export const Card = ({ children, className = "" }: CardProps) => (
  <div className={`rounded-xl border border-border bg-card shadow-sm ${className}`}>
    {children}
  </div>
);

export const CardHeader = ({ children, className = "" }: CardProps) => (
  <div
    className={`flex items-center justify-between gap-2 border-b border-border/60 px-6 py-4 ${className}`}
  >
    {children}
  </div>
);

export const CardTitle = ({ children, className = "" }: CardProps) => (
  <h3 className={`text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground ${className}`}>
    {children}
  </h3>
);

export const CardContent = ({ children, className = "" }: CardProps) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

function polarToCartesian(centerX: number, centerY: number, radius: number, angle: number) {
  const angleInRadians = (angle - 180) * (Math.PI / 180);
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
  const sweep = Math.min(endAngle - startAngle, 359.999);
  const effectiveEnd = startAngle + sweep;
  const start = polarToCartesian(x, y, radius, effectiveEnd);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = sweep <= 180 ? "0" : "1";
  return ["M", start.x, start.y, "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(" ");
}

interface CustomGaugeProps {
  value: number;
  min: number;
  max: number;
  segments: GaugeSegment[];
  pointerColor?: string;
  orientation: Orientation;
}

function CustomGauge({
  value,
  min,
  max,
  segments,
  pointerColor = "hsl(var(--muted-foreground))",
  orientation,
}: CustomGaugeProps) {
  const radius = 80;
  const strokeWidth = 10;
  const center = 100;
  const isFull = orientation === "full";
  const endAngle = isFull ? 360 : 180;
  const safeValue = clampValue(value, min, max);
  const percent = (safeValue - min) / (max - min);
  const angle = percent * endAngle - 90;
  const trackPath = describeArc(center, center, radius, 0, endAngle);

  const sorted = [...segments].sort((a, b) => a.limit - b.limit);
  let previousAngle = 0;
  const segmentPaths = sorted.map((segment, index) => {
    const ratio = Math.max(0, Math.min(1, (segment.limit - min) / (max - min)));
    const currentAngle = ratio * endAngle;
    if (currentAngle <= previousAngle) return null;
    const path = describeArc(center, center, radius, previousAngle, currentAngle);
    previousAngle = currentAngle;
    return (
      <path
        key={`${segment.color}-${index}`}
        d={path}
        fill="none"
        stroke={segment.color}
        strokeWidth={strokeWidth}
        strokeLinecap="butt"
      />
    );
  });

  return (
    <svg
      viewBox={isFull ? "0 0 200 200" : "0 0 200 110"}
      preserveAspectRatio="xMidYMid meet"
      className="h-full w-full"
    >
      <path
        d={trackPath}
        fill="none"
        stroke="hsl(var(--border))"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <g>{segmentPaths}</g>
      <g transform={`translate(${center}, ${center}) rotate(${angle})`}>
        <circle cx="0" cy="0" r="5" fill={pointerColor} stroke="hsl(var(--background))" strokeWidth="2" />
        <path d="M -2 0 L 2 0 L 0 -72 Z" fill={pointerColor} />
      </g>
    </svg>
  );
}

export interface GaugeMetricMeta {
  label: string;
  icon: LucideIcon;
}

interface MetricGaugeProps {
  metric: GaugeMetricMeta;
  config: GaugeConfig;
  displayValue: number | null;
  plotValue: number;
  mappedLabel: string | null;
  isAvailable: boolean;
  onEdit: () => void;
}

export function MetricGauge({
  metric,
  config,
  displayValue,
  plotValue,
  mappedLabel,
  isAvailable,
  onEdit,
}: MetricGaugeProps) {
  const { label, icon: Icon } = metric;
  const activeColor = isAvailable
    ? getGaugeColor(
        config.colorMode,
        plotValue,
        config.min,
        config.max,
        config.segments,
        "hsl(var(--muted-foreground))",
      )
    : "hsl(var(--muted-foreground))";
  const valueText = mappedLabel ?? formatGaugeValue(displayValue, config);
  const showUnit = !mappedLabel && displayValue !== null;
  const gaugeSizeClass =
    config.orientation === "full" ? "aspect-square max-w-[240px]" : "aspect-[2/1] max-w-[320px]";

  return (
    <Card className="relative min-h-[260px] min-w-0 transition-all duration-300 hover:border-border/80">
      <div
        className="absolute inset-x-6 top-0 h-1 opacity-40"
        style={{ background: `linear-gradient(90deg, transparent, ${activeColor}, transparent)` }}
      />
      <CardHeader>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="rounded-md p-1 text-muted-foreground transition hover:text-foreground"
                aria-label="Open gauge menu"
              >
                <MoreHorizontal size={14} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={onEdit}>Edit gauge settings</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <CardTitle className="flex items-center gap-2">
            <Icon size={14} style={{ color: activeColor }} />
            {label}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-3">
          <div className={`relative w-full ${gaugeSizeClass}`}>
            <CustomGauge
              value={plotValue}
              min={config.min}
              max={config.max}
              segments={config.segments}
              pointerColor={activeColor}
              orientation={config.orientation}
            />
          </div>
          {config.showMinMax ? (
            <div className="flex w-full max-w-[320px] justify-between text-[10px] text-muted-foreground">
              <span>{formatGaugeValue(config.min, config)}</span>
              <span>{formatGaugeValue(config.max, config)}</span>
            </div>
          ) : null}
          {config.showValue || config.showLabel ? (
            <div className="text-center pt-1">
              {config.showValue ? (
                <>
                  <div className="text-3xl font-mono font-semibold" style={{ color: activeColor }}>
                    {valueText}
                    {showUnit ? (
                      <span className="text-xs text-muted-foreground"> {config.unit}</span>
                    ) : null}
                  </div>
                  {mappedLabel ? (
                    <div className="text-xs text-muted-foreground">
                      {formatGaugeValue(displayValue, config)}
                      {showUnit ? ` ${config.unit}` : ""}
                    </div>
                  ) : null}
                </>
              ) : null}
              {config.showLabel ? (
                <div className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                  {label}
                </div>
              ) : null}
              {config.showValue ? (
                <div className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                  Live
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
