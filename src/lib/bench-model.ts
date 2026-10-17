export type Condition = "normal" | "load" | "vibration";

export type Sample = {
  time: number;
  target: number;
  speed: number;
  current: number;
  temperature: number;
  vibration: number;
  condition: Condition;
};

export type BenchSettings = {
  name: string;
  maxRpm: number;
  sampleInterval: number;
  currentWarning: number;
  temperatureWarning: number;
};

export type Experiment = {
  id: string;
  createdAt: string;
  name: string;
  settings: BenchSettings;
  samples: Sample[];
};

export const DEFAULT_SETTINGS: BenchSettings = {
  name: "Motor bench 01",
  maxRpm: 3000,
  sampleInterval: 500,
  currentWarning: 1.5,
  temperatureWarning: 45,
};

export const CONDITIONS: Record<Condition, string> = {
  normal: "Normal operation",
  load: "Added load",
  vibration: "Excess vibration",
};

export const MAX_SAMPLES = 1200;
export const MAX_EXPERIMENTS = 12;

// An illustrative response model for interface exploration, not a physical motor model.
export function simulateSample(
  previous: Sample | undefined,
  target: number,
  condition: Condition,
  settings: BenchSettings,
): Sample {
  const dt = settings.sampleInterval / 1000;
  const time = Number(((previous?.time ?? 0) + dt).toFixed(2));
  const load = condition === "load" ? 0.72 : 0;
  const disturbance = condition === "load" && previous?.condition !== "load" ? 220 : 0;
  const equilibrium = target * (condition === "load" ? 0.98 : 1);
  const before = Math.max(0, (previous?.speed ?? 0) - disturbance);
  const speed = Math.max(
    0,
    before +
      (equilibrium - before) * (1 - Math.exp(-dt / 0.85)) +
      Math.sin(time * 2.1) * 2,
  );
  const current =
    0.16 +
    (speed / settings.maxRpm) * 0.95 +
    load +
    (Math.abs(target - speed) / settings.maxRpm) * 0.5;
  const thermalTarget = 25 + current * 13;
  const temperature =
    (previous?.temperature ?? 25) +
    (thermalTarget - (previous?.temperature ?? 25)) * (1 - Math.exp(-dt / 20));
  const vibration =
    0.12 +
    (speed / settings.maxRpm) * 0.2 +
    Math.abs(Math.sin(time * 1.7)) * 0.04 +
    (condition === "vibration" ? 0.85 : 0);
  return {
    time,
    target,
    speed: Math.round(speed),
    current: Number(current.toFixed(2)),
    temperature: Number(temperature.toFixed(2)),
    vibration: Number(vibration.toFixed(3)),
    condition,
  };
}

export function getWarnings(sample: Sample | undefined, settings: BenchSettings) {
  if (!sample) return [];
  const warnings: string[] = [];
  if (sample.current > settings.currentWarning)
    warnings.push("Current above demo threshold");
  if (sample.temperature > settings.temperatureWarning)
    warnings.push("Temperature above demo threshold");
  if (sample.vibration > 0.7) warnings.push("Elevated simulated vibration");
  return warnings;
}

export function formatDuration(seconds: number) {
  return `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0")}:${Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0")}`;
}

export function downloadExperiment(experiment: Experiment) {
  const header =
    "source,time_s,target_rpm,speed_rpm,current_a,temperature_c,vibration_mm_s,condition";
  const rows = experiment.samples.map((sample) =>
    [
      "simulation",
      sample.time,
      sample.target,
      sample.speed,
      sample.current,
      sample.temperature,
      sample.vibration,
      sample.condition,
    ].join(","),
  );
  const url = URL.createObjectURL(
    new Blob([[header, ...rows].join("\n")], { type: "text/csv;charset=utf-8;" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `nexus-demo-${experiment.id}.csv`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
