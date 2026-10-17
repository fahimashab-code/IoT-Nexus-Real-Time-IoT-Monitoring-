"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  CONDITIONS,
  getWarnings,
  MAX_SAMPLES,
  simulateSample,
  type BenchSettings,
  type Condition,
  type Experiment,
  type Sample,
} from "@/lib/bench-model";
import { saveExperiment, useBenchSettings, useExperiments } from "@/lib/bench-storage";

type BenchEvent = { id: number; time: string; message: string };
type BenchContextValue = {
  running: boolean;
  samples: Sample[];
  target: number;
  setTarget: (value: number) => void;
  condition: Condition;
  setCondition: (value: Condition) => void;
  start: () => void;
  stop: () => void;
  settings: BenchSettings;
  experiments: Experiment[];
  events: BenchEvent[];
  notice: string;
};

const BenchContext = createContext<BenchContextValue | null>(null);

export function BenchProvider({ children }: { children: ReactNode }) {
  const settings = useBenchSettings();
  const experiments = useExperiments();
  const [running, setRunning] = useState(false);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [target, setTargetState] = useState(1500);
  const [condition, setConditionState] = useState<Condition>("normal");
  const [events, setEvents] = useState<BenchEvent[]>([]);
  const [notice, setNotice] = useState("");
  const recording = useRef<Sample[]>([]);
  const runSettings = useRef(settings);
  const startedAt = useRef(0);
  const eventNumber = useRef(0);
  const active = useRef(false);

  const log = useCallback((message: string) => {
    const event = {
      id: ++eventNumber.current,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      message,
    };
    setEvents((previous) => [event, ...previous].slice(0, 30));
  }, []);

  const stop = useCallback(() => {
    if (!active.current) return;
    active.current = false;
    setRunning(false);
    if (recording.current.length === 0) {
      setNotice("Demo stopped before any samples were captured.");
      log("Demo stopped. No samples captured.");
      return;
    }
    const experiment: Experiment = {
      id: `run-${startedAt.current}`,
      createdAt: new Date(startedAt.current).toISOString(),
      name: runSettings.current.name,
      settings: { ...runSettings.current },
      samples: [...recording.current],
    };
    const saved = saveExperiment(experiment);
    setNotice(
      saved
        ? "Demo saved. Review or export it in Experiments."
        : "Browser storage is full or unavailable. This run could not be saved.",
    );
    log(
      saved
        ? `Demo stopped. ${recording.current.length} samples saved.`
        : "Demo stopped. Saving to this browser failed.",
    );
  }, [log]);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      if (!active.current) return;
      const previous = recording.current.at(-1);
      const next = simulateSample(
        previous,
        Math.min(target, runSettings.current.maxRpm),
        condition,
        runSettings.current,
      );
      const oldWarnings = getWarnings(previous, runSettings.current);
      const newWarnings = getWarnings(next, runSettings.current);
      for (const warning of newWarnings) {
        if (!oldWarnings.includes(warning)) log(`Demo warning: ${warning}.`);
      }
      if (oldWarnings.length > 0 && newWarnings.length === 0) {
        log("Simulated readings returned below the demo warning thresholds.");
      }
      recording.current = [...recording.current, next];
      setSamples(recording.current);
      if (recording.current.length >= MAX_SAMPLES) stop();
    }, runSettings.current.sampleInterval);
    return () => window.clearInterval(timer);
  }, [running, target, condition, stop, log]);

  function start() {
    if (active.current) return;
    recording.current = [];
    runSettings.current = { ...settings };
    startedAt.current = Date.now();
    active.current = true;
    setSamples([]);
    setNotice("");
    setRunning(true);
    log(
      `Demo started. Target ${Math.min(target, settings.maxRpm)} RPM. ${CONDITIONS[condition]}.`,
    );
  }

  function setTarget(value: number) {
    const maximum = active.current ? runSettings.current.maxRpm : settings.maxRpm;
    const next = Math.max(0, Math.min(maximum, Math.round(value)));
    setTargetState(next);
    if (active.current) log(`Requested speed changed to ${next} RPM.`);
  }

  function setCondition(value: Condition) {
    setConditionState(value);
    if (active.current) log(`Demo condition: ${CONDITIONS[value]}.`);
  }

  return (
    <BenchContext.Provider
      value={{
        running,
        samples,
        target: Math.min(target, settings.maxRpm),
        setTarget,
        condition,
        setCondition,
        start,
        stop,
        settings,
        experiments,
        events,
        notice,
      }}
    >
      {children}
    </BenchContext.Provider>
  );
}

export function useBench() {
  const value = useContext(BenchContext);
  if (!value) throw new Error("Bench components must be used inside BenchProvider");
  return value;
}
