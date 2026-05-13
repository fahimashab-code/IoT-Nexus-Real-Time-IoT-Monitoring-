import type { OnboardedDevice } from "@/lib/onboarding/types";
const DEVICE_STORAGE_KEY = "iot_onboarded_devices";

function readStorage<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeStorage<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function loadOnboardedDevices(): OnboardedDevice[] {
  const stored = readStorage<OnboardedDevice[]>(DEVICE_STORAGE_KEY);
  if (stored && Array.isArray(stored)) {
    return stored;
  }
  return [];
}

export function saveOnboardedDevices(devices: OnboardedDevice[]) {
  writeStorage(DEVICE_STORAGE_KEY, devices);
}
