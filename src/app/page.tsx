"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  Check,
  ChevronRight,
  CircleAlert,
  Clock3,
  FlaskConical,
  Info,
  Play,
  Radio,
  RotateCw,
  Square,
  Thermometer,
  Waves,
  Zap,
} from "lucide-react";
import { useBench } from "@/components/bench/BenchProvider";
import { MotorDiagram } from "@/components/bench/MotorDiagram";
import { METRICS, TelemetryChart, type Metric } from "@/components/bench/TelemetryChart";
import {
  CONDITIONS,
  formatDuration,
  getWarnings,
  type Condition,
} from "@/lib/bench-model";

export default function TestBenchPage() {
  const {
    running,
    samples,
    target,
    setTarget,
    condition,
    setCondition,
    start,
    stop,
    settings,
    events,
    notice,
  } = useBench();
  const [metric, setMetric] = useState<Metric>("speed");
  const latest = samples.at(-1);
  const warnings = getWarnings(latest, settings);
  const visibleSamples = samples.slice(-120);
  const sensorCards = [
    {
      label: "Motor speed",
      value: latest?.speed.toLocaleString(),
      unit: "RPM",
      icon: RotateCw,
      note: latest
        ? `${latest.target.toLocaleString()} RPM requested`
        : "Waiting for first run",
      color: "orange",
    },
    {
      label: "Current",
      value: latest?.current.toFixed(2),
      unit: "A",
      icon: Zap,
      note: `Demo threshold · ${settings.currentWarning} A`,
      color: "blue",
    },
    {
      label: "Temperature",
      value: latest?.temperature.toFixed(1),
      unit: "°C",
      icon: Thermometer,
      note: `Demo threshold · ${settings.temperatureWarning} °C`,
      color: "gold",
    },
    {
      label: "Vibration",
      value: latest?.vibration.toFixed(2),
      unit: "mm/s",
      icon: Waves,
      note: "Illustrative vibration level",
      color: "purple",
    },
  ];

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span /> THE MOTOR LAB <span className="eyebrow-slash">/</span> PROJECT 001
          </div>
          <h1>
            Motor test bench<span className="heading-dot">.</span>
          </h1>
          <p>Understand the motor. Observe the response. Build from evidence.</p>
        </div>
        <Link href="/experiments" className="button button-white">
          <FlaskConical size={16} />
          View experiments
          <ArrowRight size={15} />
        </Link>
      </div>

      <div className="demo-banner">
        <span className="demo-icon">
          <FlaskConical size={19} />
        </span>
        <div>
          <strong>You’re in demo mode</strong>
          <span>
            Explore the controls with simulated measurements. No hardware commands are
            sent.
          </span>
        </div>
        <Link href="/settings">
          Device setup
          <ArrowRight size={15} />
        </Link>
      </div>

      <div className="bench-grid">
        <section className="panel bench-overview" aria-labelledby="overview-title">
          <div className="panel-header">
            <div>
              <span className="section-kicker">THE SETUP</span>
              <h2 id="overview-title">{settings.name}</h2>
            </div>
            <span className={`pill ${running ? "pill-green" : "pill-neutral"}`}>
              <span className="status-dot" />
              {running ? "Demo running" : "Demo idle"}
            </span>
          </div>
          <MotorDiagram running={running} />
          <div className="diagram-footer">
            <span>
              <span className="small-dot" />
              Illustrative signal layout
            </span>
            <span>
              ESP32 <ChevronRight size={12} /> Driver <ChevronRight size={12} /> DC motor
            </span>
          </div>
        </section>

        <section className="panel control-panel" aria-labelledby="control-title">
          <div className="panel-header">
            <div>
              <span className="section-kicker">TAKE CONTROL</span>
              <h2 id="control-title">Motor controls</h2>
            </div>
            <span className="label-tag">SIMULATION</span>
          </div>
          <div className="target-heading">
            <label htmlFor="target-speed">Requested speed</label>
            <div>
              <strong>{target.toLocaleString()}</strong>
              <span>RPM</span>
            </div>
          </div>
          <input
            id="target-speed"
            className="speed-slider"
            type="range"
            min="0"
            max={settings.maxRpm}
            step="50"
            value={target}
            onChange={(event) => setTarget(Number(event.target.value))}
            aria-valuetext={`${target} RPM`}
          />
          <div className="range-labels">
            <span>0 RPM</span>
            <span>{settings.maxRpm.toLocaleString()} RPM</span>
          </div>
          <div className="condition-field">
            <label htmlFor="condition">Demo condition</label>
            <select
              id="condition"
              value={condition}
              onChange={(event) => setCondition(event.target.value as Condition)}
            >
              {Object.entries(CONDITIONS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="control-actions">
            <button className="button button-primary" onClick={start} disabled={running}>
              <Play size={15} fill="currentColor" />
              Run demo
            </button>
            <button className="button button-white" onClick={stop} disabled={!running}>
              <Square size={14} fill="currentColor" />
              Stop & save
            </button>
          </div>
          <p className="control-footnote">
            <Info size={13} />
            Each stopped run is saved in this browser.
          </p>
        </section>
      </div>

      {notice && (
        <div className="notice" role="status">
          <Info size={16} />
          <span>{notice}</span>
          <Link href="/experiments">
            Experiments
            <ArrowRight size={14} />
          </Link>
        </div>
      )}
      {warnings.length > 0 && (
        <div className="warning-banner" role="status">
          <CircleAlert size={17} />
          <span>
            <strong>Demo warning:</strong> {warnings.join(" · ")}. These are simulated
            conditions.
          </span>
        </div>
      )}

      <div className="readings-heading">
        <h2>Sensor readings</h2>
        <span>
          {latest
            ? running
              ? "Simulated · updating"
              : "Simulated · last captured sample"
            : "Simulated · no samples yet"}
        </span>
      </div>
      <div className="sensor-grid">
        {sensorCards.map(({ label, value, unit, icon: Icon, note, color }) => (
          <section className="panel sensor-card" key={label}>
            <div className="sensor-label">
              <span>{label}</span>
              <span className={`sensor-icon ${color}`}>
                <Icon size={17} />
              </span>
            </div>
            <div className="sensor-value">
              <strong>{value ?? "—"}</strong>
              <span>{unit}</span>
            </div>
            <p>{note}</p>
          </section>
        ))}
      </div>

      <div className="analysis-grid">
        <section className="panel response-panel" aria-labelledby="response-title">
          <div className="panel-header">
            <div>
              <h2 id="response-title">Motor response</h2>
              <p>Watch how the system responds over time.</p>
            </div>
            <select
              className="metric-select"
              aria-label="Chart measurement"
              value={metric}
              onChange={(event) => setMetric(event.target.value as Metric)}
            >
              {Object.entries(METRICS).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>
          <div className="chart-legend">
            <span>
              <i style={{ background: METRICS[metric].color }} />
              {metric === "speed" ? "Measured speed" : METRICS[metric].label}
            </span>
            {metric === "speed" && (
              <span>
                <i className="dashed-key" />
                Requested speed
              </span>
            )}
            <span className="chart-unit">{METRICS[metric].unit} · SIMULATED</span>
          </div>
          <TelemetryChart
            samples={visibleSamples}
            metric={metric}
            maxRpm={settings.maxRpm}
          />
          <div className="chart-footer">
            <span>
              <Clock3 size={13} />
              {formatDuration(latest?.time ?? 0)} elapsed
            </span>
            <span>
              {samples.length} samples <span className="footer-separator">/</span>{" "}
              {settings.sampleInterval} ms interval
            </span>
          </div>
        </section>
        <section className="panel events-panel" aria-labelledby="events-title">
          <div className="panel-header">
            <div>
              <h2 id="events-title">Bench activity</h2>
              <p>A clear record of what changed.</p>
            </div>
            <Radio size={17} className="muted-icon" />
          </div>
          {events.length ? (
            <ol className="event-list">
              {events.slice(0, 6).map((event) => (
                <li key={event.id}>
                  <span className="event-marker" />
                  <div>
                    <p>{event.message}</p>
                    <time>{event.time}</time>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <div className="events-empty">
              <span>
                <Activity size={21} />
              </span>
              <strong>A quiet bench, for now.</strong>
              <p>Demo starts, control changes, and stops will appear here.</p>
            </div>
          )}
          <div className="event-foot">
            <span className="small-dot" />
            Session activity · simulated
          </div>
        </section>
      </div>

      <div className="next-stage">
        <span className="next-stage-icon">
          <ArrowDownRight size={21} />
        </span>
        <div>
          <strong>From the screen to the workbench.</strong>
          <p>
            The next stage connects your ESP32, motor driver, and sensors to this
            workspace.
          </p>
        </div>
        <Link href="/settings">
          Prepare the device
          <ArrowRight size={15} />
        </Link>
      </div>
      <div className="page-note">
        <Check size={13} />
        No account needed.
        <span />
        Your demo experiments stay in this browser.
      </div>
    </>
  );
}
