"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SchemaFieldDialog } from "@/components/onboarding/SchemaFieldDialog";
import { SchemaFieldsTable } from "@/components/onboarding/SchemaFieldsTable";
import { toast } from "@/components/ui/use-toast";
import type { DeviceSchemaField, OnboardedDevice } from "@/lib/onboarding/types";
import {
  DEFAULT_IOT_ENDPOINT,
  DEFAULT_TOPIC_PATTERN,
  buildPayloadPreview,
  flattenJsonToSchema,
  resolveTopicPattern,
  schemaToPayload,
} from "@/lib/onboarding/utils";
import { loadOnboardedDevices, saveOnboardedDevices } from "@/lib/onboarding/store";

type ProvisioningBundle = {
  thingName: string;
  deviceId: string;
  endpoint: string;
  topic: string;
  policyName: string;
  certificatePem: string;
  privateKeyPem: string;
  rootCaPem: string;
};

function buildMockPem(label: string) {
  const body = Array.from({ length: 5 })
    .map(() => Math.random().toString(36).slice(2, 14))
    .join("\n");
  return `-----BEGIN ${label}-----\n${body}\n-----END ${label}-----`;
}

function buildMockBundle(deviceId: string, topicPattern: string): ProvisioningBundle {
  return {
    thingName: deviceId,
    deviceId,
    endpoint: DEFAULT_IOT_ENDPOINT,
    topic: resolveTopicPattern(topicPattern, deviceId),
    policyName: `iot-${deviceId}-policy`,
    certificatePem: buildMockPem("CERTIFICATE"),
    privateKeyPem: buildMockPem("PRIVATE KEY"),
    rootCaPem: buildMockPem("ROOT CA"),
  };
}

export default function DeviceOnboardPage() {
  const [name, setName] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [location, setLocation] = useState("");
  const [topicPattern, setTopicPattern] = useState(DEFAULT_TOPIC_PATTERN);
  const [fields, setFields] = useState<DeviceSchemaField[]>([]);
  const [jsonInput, setJsonInput] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [jsonWarnings, setJsonWarnings] = useState<string[]>([]);
  const [payloadDialogOpen, setPayloadDialogOpen] = useState(false);
  const [payloadSnapshot, setPayloadSnapshot] = useState<{
    fields: DeviceSchemaField[];
    jsonInput: string;
    jsonError: string | null;
    jsonWarnings: string[];
  } | null>(null);
  const [bundle, setBundle] = useState<ProvisioningBundle | null>(null);
  const [fieldDialogOpen, setFieldDialogOpen] = useState(false);
  const [activeField, setActiveField] = useState<DeviceSchemaField | null>(null);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [messages, setMessages] = useState<Record<string, unknown>[]>([]);
  const [lastMessageAt, setLastMessageAt] = useState<string | null>(null);

  const suggestedId = useMemo(
    () => `device-${Math.floor(Math.random() * 900 + 100)}`,
    [],
  );
  const resolvedDeviceId = deviceId.trim() || suggestedId;
  const topicError = !topicPattern.trim()
    ? "Topic pattern is required."
    : topicPattern.includes("{deviceId}")
      ? ""
      : "Topic pattern must include {deviceId}.";

  const fieldKeyError = useMemo(() => {
    const keys = fields.map((field) => field.key.trim().toLowerCase());
    const unique = new Set(keys);
    return unique.size !== keys.length ? "Field keys must be unique." : "";
  }, [fields]);

  const canGenerateBundle = name.trim().length > 0 && !topicError;
  const canSave = name.trim().length > 0 && !topicError && !fieldKeyError && fields.length > 0;

  const handleAddField = () => {
    if (isLocked) return;
    setActiveField(null);
    setEditingKey(null);
    setFieldDialogOpen(true);
  };

  const handleEditField = (field: DeviceSchemaField) => {
    if (isLocked) return;
    setActiveField(field);
    setEditingKey(field.key);
    setFieldDialogOpen(true);
  };

  const handleSaveField = (nextField: DeviceSchemaField) => {
    setFields((prev) => {
      if (editingKey) {
        return prev.map((item) => (item.key === editingKey ? nextField : item));
      }
      return [...prev, nextField];
    });
    setEditingKey(null);
  };

  const handleRemoveField = (key: string) => {
    if (isLocked) return;
    setFields((prev) => prev.filter((field) => field.key !== key));
  };

  const handleOpenPayloadDialog = () => {
    setPayloadSnapshot({
      fields,
      jsonInput,
      jsonError,
      jsonWarnings,
    });
    setPayloadDialogOpen(true);
  };

  const handleCancelPayloadDialog = () => {
    if (payloadSnapshot) {
      setFields(payloadSnapshot.fields);
      setJsonInput(payloadSnapshot.jsonInput);
      setJsonError(payloadSnapshot.jsonError);
      setJsonWarnings(payloadSnapshot.jsonWarnings);
    }
    setPayloadDialogOpen(false);
  };

  const handleSavePayloadDialog = () => {
    setPayloadDialogOpen(false);
  };

  const handleConvertJsonToSchema = () => {
    if (isLocked) return;
    try {
      const parsed = JSON.parse(jsonInput);
      const result = flattenJsonToSchema(parsed);
      if (result.fields.length === 0) {
        setJsonError("No fields found in JSON.");
        setJsonWarnings(result.warnings);
        return;
      }
      setJsonError(null);
      setJsonWarnings(result.warnings);
      setFields(result.fields);
      toast({
        title: "Schema generated",
        description: `Added ${result.fields.length} field(s) from JSON.`,
      });
    } catch (error) {
      setJsonError((error as Error)?.message ?? "Invalid JSON.");
    }
  };

  const handleUpdateJsonFromSchema = () => {
    const payload = schemaToPayload(fields, resolvedDeviceId);
    setJsonInput(JSON.stringify(payload, null, 2));
    setJsonError(null);
    setJsonWarnings([]);
  };

  const handleGenerateBundle = () => {
    if (!canGenerateBundle) {
      toast({
        title: "Missing info",
        description: "Provide a device name and valid topic pattern first.",
      });
      return;
    }
    setBundle(buildMockBundle(resolvedDeviceId, topicPattern));
    toast({
      title: "Credentials generated",
      description: "Mock certificate bundle is ready to download.",
    });
  };

  const handleDownloadBundle = () => {
    if (!bundle) return;
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${bundle.deviceId}-bundle.json`;
    anchor.click();
    window.URL.revokeObjectURL(url);
  };

  const handleSaveDevice = () => {
    if (!canSave) {
      toast({
        title: "Fix onboarding fields",
        description: topicError || fieldKeyError || "Add at least one payload field.",
      });
      return;
    }
    if (!bundle) {
      toast({
        title: "Generate credentials",
        description: "Create the certificate bundle before saving.",
      });
      return;
    }
    const now = new Date().toISOString();
    const existing = loadOnboardedDevices().some((device) => device.id === resolvedDeviceId);
    if (existing) {
      toast({
        title: "Device already exists",
        description: "Choose a different device ID before saving.",
      });
      return;
    }
    const onboardedDevice: OnboardedDevice = {
      id: resolvedDeviceId,
      name: name.trim(),
      location: location.trim() || undefined,
      endpoint: bundle.endpoint,
      firmware: "v1.0.0",
      topicPattern: topicPattern.trim(),
      schema: fields,
      createdAt: now,
    };
    const next = [onboardedDevice, ...loadOnboardedDevices()];
    saveOnboardedDevices(next);
    toast({
      title: "Device onboarded",
      description: "Device saved locally for demo purposes.",
    });
    setIsLocked(true);
    setIsStreaming(false);
  };

  const resolvedTopic = resolveTopicPattern(topicPattern || DEFAULT_TOPIC_PATTERN, resolvedDeviceId);
  const schemaPreview = useMemo(
    () => JSON.stringify(schemaToPayload(fields, resolvedDeviceId), null, 2),
    [fields, resolvedDeviceId],
  );

  useEffect(() => {
    if (!isStreaming) return;
    const interval = window.setInterval(() => {
      const payload = buildPayloadPreview(fields, resolvedDeviceId);
      payload.timestamp = Date.now();
      setMessages((prev) => [payload, ...prev].slice(0, 5));
      setLastMessageAt(new Date().toISOString());
    }, 2000);
    return () => window.clearInterval(interval);
  }, [fields, isStreaming, resolvedDeviceId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Onboard Device</h1>
          <p className="text-sm text-muted-foreground">
            Register a device, define telemetry schema, and generate credentials (mocked).
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/app/devices">Back to Devices</Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Device Identity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Device name</label>
                <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Pump 01" disabled={isLocked} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Device ID (optional)</label>
                <Input value={deviceId} onChange={(event) => setDeviceId(event.target.value)} placeholder={suggestedId} disabled={isLocked} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Location (optional)</label>
                <Input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Warehouse A" disabled={isLocked} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>MQTT Topic</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Topic pattern</label>
                <Input
                  value={topicPattern}
                  onChange={(event) => setTopicPattern(event.target.value)}
                  placeholder={DEFAULT_TOPIC_PATTERN}
                  disabled={isLocked}
                />
                {topicError ? <p className="text-xs text-destructive">{topicError}</p> : null}
              </div>
              <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
                <p>
                  Resolved example:{" "}
                  <span className="font-medium text-foreground">{resolvedTopic}</span>
                </p>
                <p className="mt-1">
                  Supported variables: <span className="font-medium text-foreground">{`{deviceId}`}</span>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payload Definition</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Define the MQTT payload schema and JSON structure. This becomes the contract for incoming data.
              </p>
              <div className="rounded-lg border bg-muted/20 p-3 text-xs text-muted-foreground">
                <p>
                  <span className="font-medium text-foreground">Fields:</span> {fields.length || 0}
                </p>
                <p className="mt-1 truncate">
                  <span className="font-medium text-foreground">Keys:</span>{" "}
                  {fields.length > 0
                    ? fields.slice(0, 4).map((field) => field.key).join(", ")
                    : "None yet"}
                  {fields.length > 4 ? "…" : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleOpenPayloadDialog}>
                  {fields.length > 0 ? "Edit payload definition" : "Define payload"}
                </Button>
                {isLocked ? (
                  <p className="text-xs text-muted-foreground">
                    Schema is locked after onboarding. Create a new device to change it.
                  </p>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Provisioning Bundle (Mock)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                This step simulates what the backend will do: create an IoT Thing, generate certificates, attach policies,
                and give you a bundle for device firmware.
              </p>
              <div className="rounded-lg border bg-muted/30 p-3 text-xs">
                <p className="font-medium text-foreground">What you will receive:</p>
                <ul className="mt-2 space-y-1">
                  <li>- MQTT endpoint</li>
                  <li>- Device certificate + private key</li>
                  <li>- Root CA</li>
                  <li>- Topic pattern + policy name</li>
                </ul>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleGenerateBundle} disabled={!canGenerateBundle}>
                  Generate bundle
                </Button>
                <Button variant="outline" onClick={handleDownloadBundle} disabled={!bundle}>
                  Download bundle
                </Button>
              </div>
              {bundle ? (
                <div className="rounded-lg border bg-muted/20 p-3 text-xs">
                  <p className="text-muted-foreground">Bundle summary</p>
                  <p className="mt-2">
                    <span className="font-medium text-foreground">Endpoint:</span> {bundle.endpoint}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Topic:</span> {bundle.topic}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Policy:</span> {bundle.policyName}
                  </p>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Review & Save</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Confirm the device identity, topic pattern, and schema before saving.</p>
              <div className="rounded-lg border bg-muted/20 p-3 text-xs">
                <p>
                  <span className="font-medium text-foreground">Device ID:</span> {resolvedDeviceId}
                </p>
                <p>
                  <span className="font-medium text-foreground">Fields:</span> {fields.length}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleSaveDevice} disabled={!canSave || isLocked}>
                  Save device
                </Button>
                {isLocked ? (
                  <Button variant="outline" asChild>
                    <Link href={`/app/devices/${resolvedDeviceId}`}>Open device</Link>
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Live Data Monitor (Mock)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em]">Status</p>
                  <p className="font-medium text-foreground">
                    {isStreaming ? "Receiving data" : isLocked ? "Waiting for data" : "Not configured"}
                  </p>
                  {lastMessageAt ? (
                    <p className="text-xs">Last message: {new Date(lastMessageAt).toLocaleTimeString()}</p>
                  ) : null}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setIsStreaming((prev) => !prev)}
                  disabled={!isLocked || fields.length === 0}
                >
                  {isStreaming ? "Stop mock stream" : "Start mock stream"}
                </Button>
              </div>
              <div className="rounded-lg border bg-muted/20 p-3 text-xs">
                <p className="text-muted-foreground">Incoming payloads</p>
                {messages.length === 0 ? (
                  <p className="mt-2 text-xs">No messages yet.</p>
                ) : (
                  <div className="mt-2 space-y-2">
                    {messages.map((payload, index) => (
                      <pre
                        key={`${index}-${String(payload.timestamp)}`}
                        className="whitespace-pre-wrap rounded-md border bg-background/80 p-2 text-[10px]"
                      >
                        {JSON.stringify(payload, null, 2)}
                      </pre>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <SchemaFieldDialog
        open={fieldDialogOpen}
        onOpenChange={setFieldDialogOpen}
        field={activeField}
        existingKeys={fields.map((field) => field.key)}
        onSave={handleSaveField}
      />
      <Dialog open={payloadDialogOpen} onOpenChange={(open) => (open ? handleOpenPayloadDialog() : handleCancelPayloadDialog())}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Payload Definition</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium">Schema fields</p>
                <Button variant="outline" onClick={handleAddField} disabled={isLocked}>
                  Add field
                </Button>
              </div>
              {fieldKeyError ? <p className="text-xs text-destructive">{fieldKeyError}</p> : null}
              <SchemaFieldsTable
                fields={fields}
                onEdit={handleEditField}
                onRemove={handleRemoveField}
                readOnly={isLocked}
              />
              <p className="text-xs text-muted-foreground">
                Keys must match the device payload. Nested keys use dot notation (example:
                <span className="font-medium text-foreground"> telemetry.pressure</span>). Arrays use
                <span className="font-medium text-foreground"> []</span> (example:
                <span className="font-medium text-foreground"> metrics[].value</span>).
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium">MQTT JSON payload</p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={handleConvertJsonToSchema} disabled={isLocked}>
                    Convert JSON → Schema
                  </Button>
                  <Button variant="ghost" onClick={handleUpdateJsonFromSchema}>
                    Update JSON from Schema
                  </Button>
                </div>
              </div>
              <textarea
                className="min-h-[360px] w-full rounded-md border border-input bg-background p-3 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder={schemaPreview}
                value={jsonInput}
                onChange={(event) => setJsonInput(event.target.value)}
                disabled={isLocked}
              />
              {jsonError ? <p className="text-xs text-destructive">{jsonError}</p> : null}
              {jsonWarnings.length > 0 ? (
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium text-foreground">JSON warnings</p>
                  <ul className="mt-1 space-y-1">
                    {jsonWarnings.map((warning) => (
                      <li key={warning}>- {warning}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <div className="rounded-lg border bg-muted/20 p-3 text-xs text-muted-foreground">
                Timestamp behavior: if the device sends a{" "}
                <span className="font-medium text-foreground">timestamp</span> field, it must always be included. If the
                device does not send it, the server will add one on ingest.
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancelPayloadDialog}>
              Cancel
            </Button>
            <Button onClick={handleSavePayloadDialog}>
              Save payload
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
