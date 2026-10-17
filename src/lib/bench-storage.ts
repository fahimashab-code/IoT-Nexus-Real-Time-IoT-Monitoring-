"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  DEFAULT_SETTINGS,
  MAX_EXPERIMENTS,
  MAX_SAMPLES,
  type BenchSettings,
  type Experiment,
  type Sample,
} from "./bench-model";

const SETTINGS_KEY = "nexus-bench-settings-v1";
const EXPERIMENTS_KEY = "nexus-bench-experiments-v1";
const CHANGE_EVENT = "nexus-storage-change";

function read(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event(CHANGE_EVENT));
    return true;
  } catch {
    return false;
  }
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

function parse(value: string | null): unknown {
  try {
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function isSettings(value: unknown): value is BenchSettings {
  if (!value || typeof value !== "object") return false;
  const item = value as BenchSettings;
  return (
    typeof item.name === "string" &&
    item.name.trim().length > 0 &&
    item.name.length <= 60 &&
    Number.isFinite(item.maxRpm) &&
    item.maxRpm >= 500 &&
    item.maxRpm <= 10000 &&
    [250, 500, 1000].includes(item.sampleInterval) &&
    Number.isFinite(item.currentWarning) &&
    item.currentWarning >= 0.1 &&
    item.currentWarning <= 20 &&
    Number.isFinite(item.temperatureWarning) &&
    item.temperatureWarning >= 26 &&
    item.temperatureWarning <= 100
  );
}

function isSample(value: unknown): value is Sample {
  if (!value || typeof value !== "object") return false;
  const item = value as Sample;
  return (
    [
      item.time,
      item.target,
      item.speed,
      item.current,
      item.temperature,
      item.vibration,
    ].every(Number.isFinite) && ["normal", "load", "vibration"].includes(item.condition)
  );
}

function parseExperiments(raw: string | null): Experiment[] {
  const value = parse(raw);
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (item): item is Experiment =>
        item &&
        typeof item.id === "string" &&
        typeof item.name === "string" &&
        typeof item.createdAt === "string" &&
        Number.isFinite(Date.parse(item.createdAt)) &&
        isSettings(item.settings) &&
        Array.isArray(item.samples) &&
        item.samples.length > 0 &&
        item.samples.length <= MAX_SAMPLES &&
        item.samples.every(isSample),
    )
    .slice(0, MAX_EXPERIMENTS);
}

const serverSnapshot = () => null;
const settingsSnapshot = () => read(SETTINGS_KEY);
const experimentsSnapshot = () => read(EXPERIMENTS_KEY);

export function useBenchSettings() {
  const raw = useSyncExternalStore(subscribe, settingsSnapshot, serverSnapshot);
  return useMemo(() => {
    const value = parse(raw);
    return isSettings(value) ? value : DEFAULT_SETTINGS;
  }, [raw]);
}

export function useExperiments() {
  const raw = useSyncExternalStore(subscribe, experimentsSnapshot, serverSnapshot);
  return useMemo(() => parseExperiments(raw), [raw]);
}

export function saveBenchSettings(settings: BenchSettings) {
  return isSettings(settings) && write(SETTINGS_KEY, settings);
}

export function saveExperiment(experiment: Experiment) {
  const existing = parseExperiments(read(EXPERIMENTS_KEY));
  return write(
    EXPERIMENTS_KEY,
    [experiment, ...existing.filter((item) => item.id !== experiment.id)].slice(
      0,
      MAX_EXPERIMENTS,
    ),
  );
}
