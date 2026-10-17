"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, Download, FlaskConical, Info } from "lucide-react";
import { useBench } from "@/components/bench/BenchProvider";
import { TelemetryChart, METRICS, type Metric } from "@/components/bench/TelemetryChart";
import { downloadExperiment, formatDuration, MAX_EXPERIMENTS } from "@/lib/bench-model";

export default function ExperimentsPage() {
  const { experiments, running } = useBench();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [metric, setMetric] = useState<Metric>("speed");
  const selected = experiments.find((item) => item.id === selectedId) ?? experiments[0];
  const averageError = selected
    ? selected.samples.reduce(
        (sum, item) => sum + Math.abs(item.target - item.speed),
        0,
      ) / selected.samples.length
    : 0;

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span /> THE MOTOR LAB <span className="eyebrow-slash">/</span> EXPERIMENT LOG
          </div>
          <h1>
            Every run, a little clearer<span className="heading-dot">.</span>
          </h1>
          <p>Review the response. Keep the measurements. Learn from the next run.</p>
        </div>
        <Link href="/" className="button button-primary">
          <FlaskConical size={16} />
          Back to the bench
          <ArrowRight size={15} />
        </Link>
      </div>
      <div className="demo-banner">
        <span className="demo-icon">
          <Info size={19} />
        </span>
        <div>
          <strong>Your local experiment notebook</strong>
          <span>
            The latest {MAX_EXPERIMENTS} demo runs are stored in this browser. Export CSV
            files to keep a permanent copy.
          </span>
        </div>
        <span className="pill pill-neutral">{experiments.length} saved</span>
      </div>
      {!experiments.length ? (
        <section className="panel large-empty">
          <span className="large-empty-icon">
            <FlaskConical size={32} strokeWidth={1.5} />
          </span>
          <span className="section-kicker">A FRESH NOTEBOOK</span>
          <h2>Your first experiment is waiting.</h2>
          <p>
            Start a demo on the test bench, adjust the speed or load,
            <br className="desktop-break" /> then choose Stop & save. Your measurements
            will appear here.
          </p>
          {running && (
            <p className="running-hint">
              <span className="status-dot pulsing" />A demo is running. Stop it on the
              bench to save the recording.
            </p>
          )}
          <Link href="/" className="button button-primary">
            Open test bench
            <ArrowRight size={16} />
          </Link>
        </section>
      ) : (
        <>
          <section className="panel experiment-table-panel">
            <div className="panel-header">
              <div>
                <h2>Recorded experiments</h2>
                <p>Every recording below contains simulated data.</p>
              </div>
              <FlaskConical size={18} className="muted-icon" />
            </div>
            <div className="table-scroll">
              <table className="experiment-table">
                <thead>
                  <tr>
                    <th>Experiment</th>
                    <th>Recorded</th>
                    <th>Duration</th>
                    <th>Samples</th>
                    <th>Source</th>
                    <th>
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {experiments.map((experiment) => (
                    <tr
                      key={experiment.id}
                      className={selected?.id === experiment.id ? "selected-row" : ""}
                    >
                      <td>
                        <strong>{experiment.name}</strong>
                        <small>{experiment.id}</small>
                      </td>
                      <td>
                        {new Date(experiment.createdAt).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="mono">
                        {formatDuration(experiment.samples.at(-1)?.time ?? 0)}
                      </td>
                      <td className="mono">{experiment.samples.length}</td>
                      <td>
                        <span className="label-tag">DEMO</span>
                      </td>
                      <td>
                        <button
                          className="text-button"
                          onClick={() => setSelectedId(experiment.id)}
                          aria-label={`Review ${experiment.name}, ${experiment.id}`}
                          aria-pressed={selected?.id === experiment.id}
                        >
                          {selected?.id === experiment.id ? (
                            <>
                              <Check size={14} />
                              Selected
                            </>
                          ) : (
                            <>
                              Review
                              <ArrowRight size={14} />
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          {selected && (
            <section className="panel experiment-review">
              <div className="panel-header">
                <div>
                  <span className="section-kicker">RUN REVIEW · SIMULATED</span>
                  <h2>{selected.name}</h2>
                  <p>{new Date(selected.createdAt).toLocaleString()}</p>
                </div>
                <button
                  className="button button-white"
                  onClick={() => downloadExperiment(selected)}
                >
                  <Download size={15} />
                  Export CSV
                </button>
              </div>
              <div className="review-stats">
                <div>
                  <span>Duration</span>
                  <strong>{formatDuration(selected.samples.at(-1)?.time ?? 0)}</strong>
                </div>
                <div>
                  <span>Mean speed error</span>
                  <strong>
                    {averageError.toFixed(0)}
                    <small> RPM</small>
                  </strong>
                </div>
                <div>
                  <span>Peak current</span>
                  <strong>
                    {Math.max(...selected.samples.map((item) => item.current)).toFixed(2)}
                    <small> A</small>
                  </strong>
                </div>
                <div>
                  <span>Sample interval</span>
                  <strong>
                    {selected.settings.sampleInterval}
                    <small> ms</small>
                  </strong>
                </div>
              </div>
              <div className="review-chart-heading">
                <span>
                  {METRICS[metric].label} / {METRICS[metric].unit}
                </span>
                <select
                  className="metric-select"
                  aria-label="Review measurement"
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
              <TelemetryChart
                samples={selected.samples}
                metric={metric}
                maxRpm={selected.settings.maxRpm}
              />
              <p className="review-note">
                Mean speed error includes startup and every recorded speed change. Demo
                values illustrate the interface; they are not hardware validation.
              </p>
            </section>
          )}
        </>
      )}
    </>
  );
}
