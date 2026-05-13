import type { DeviceSchemaField, SchemaFieldType } from "@/lib/onboarding/types";

export const DEFAULT_IOT_ENDPOINT = "a1b2c3d4e5f6g7-ats.iot.us-east-1.amazonaws.com";
export const DEFAULT_TOPIC_PATTERN = "devices/{deviceId}/telemetry";

type FlattenResult = {
  fields: DeviceSchemaField[];
  warnings: string[];
};

function inferType(value: unknown): SchemaFieldType {
  if (typeof value === "number") return "number";
  if (typeof value === "boolean") return "boolean";
  return "string";
}

function toSample(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return undefined;
}

function addField(
  fields: DeviceSchemaField[],
  warnings: string[],
  key: string,
  value: unknown,
) {
  const normalizedKey = key.trim();
  if (!normalizedKey) return;
  if (fields.some((field) => field.key === normalizedKey)) {
    warnings.push(`Duplicate key "${normalizedKey}" skipped.`);
    return;
  }
  fields.push({
    key: normalizedKey,
    type: inferType(value),
    sample: toSample(value),
    required: false,
  });
}

function flattenJson(
  value: unknown,
  path: string,
  fields: DeviceSchemaField[],
  warnings: string[],
) {
  if (Array.isArray(value)) {
    const label = path || "root";
    if (value.length === 0) {
      warnings.push(`Array "${label}" is empty; unable to infer schema.`);
      return;
    }
    const first = value[0];
    const types = new Set(value.map((item) => typeof item));
    if (types.size > 1) {
      warnings.push(`Array "${label}" has mixed types; using the first item.`);
    }
    if (first && typeof first === "object" && !Array.isArray(first)) {
      const nestedPath = path ? `${path}[]` : "[]";
      Object.entries(first as Record<string, unknown>).forEach(([key, val]) => {
        flattenJson(val, `${nestedPath}.${key}`, fields, warnings);
      });
      return;
    }
    addField(fields, warnings, `${path}[]`, first);
    return;
  }

  if (value && typeof value === "object") {
    Object.entries(value as Record<string, unknown>).forEach(([key, val]) => {
      const nextPath = path ? `${path}.${key}` : key;
      flattenJson(val, nextPath, fields, warnings);
    });
    return;
  }

  addField(fields, warnings, path, value);
}

export function flattenJsonToSchema(payload: unknown): FlattenResult {
  const warnings: string[] = [];
  const fields: DeviceSchemaField[] = [];

  if (!payload || typeof payload !== "object") {
    return { fields, warnings: ["Payload must be a JSON object."] };
  }

  flattenJson(payload, "", fields, warnings);
  return { fields, warnings };
}

function setPathValue(target: Record<string, unknown>, path: string, value: unknown) {
  const segments = path.split(".").filter(Boolean);
  let current: Record<string, unknown> = target;

  segments.forEach((segment, index) => {
    const isArray = segment.endsWith("[]");
    const key = isArray ? segment.slice(0, -2) : segment;
    const isLast = index === segments.length - 1;

    if (isArray) {
      const existing = current[key];
      const nextArray = Array.isArray(existing) ? existing : [];
      if (isLast) {
        nextArray[0] = value;
        current[key] = nextArray;
        return;
      }
      if (!nextArray[0] || typeof nextArray[0] !== "object") {
        nextArray[0] = {};
      }
      current[key] = nextArray;
      current = nextArray[0] as Record<string, unknown>;
      return;
    }

    if (isLast) {
      current[key] = value;
      return;
    }

    if (!current[key] || typeof current[key] !== "object") {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  });
}

export function schemaToPayload(
  fields: DeviceSchemaField[],
  deviceId: string,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  fields.forEach((field) => {
    let value: unknown;
    if (field.sample?.trim()) {
      const sample = field.sample.trim();
      if (field.type === "number") {
        const parsed = Number(sample);
        value = Number.isNaN(parsed) ? sampleValueForType(field.type, field.key) : parsed;
      } else if (field.type === "boolean") {
        value = sample.toLowerCase() === "true";
      } else {
        value = sample;
      }
    } else {
      value = sampleValueForType(field.type, field.key);
    }
    setPathValue(payload, field.key, value);
  });

  if (!Object.prototype.hasOwnProperty.call(payload, "deviceId")) {
    payload.deviceId = deviceId;
  }
  if (!Object.prototype.hasOwnProperty.call(payload, "timestamp")) {
    payload.timestamp = 1710000000;
  }

  return payload;
}

export function resolveTopicPattern(pattern: string, deviceId: string) {
  return pattern.replace("{deviceId}", deviceId);
}

export function sampleValueForType(type: SchemaFieldType, key: string) {
  if (type === "number") return Math.round((Math.random() * 90 + 10) * 10) / 10;
  if (type === "boolean") return true;
  return `${key}-value`;
}

export function buildPayloadPreview(
  fields: DeviceSchemaField[],
  deviceId = "device-001",
) {
  return schemaToPayload(fields, deviceId);
}
