"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DeviceSchemaField, SchemaFieldType } from "@/lib/onboarding/types";

type SchemaFieldDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  field?: DeviceSchemaField | null;
  existingKeys: string[];
  onSave: (field: DeviceSchemaField) => void;
};

const FIELD_TYPES: SchemaFieldType[] = ["number", "boolean", "string"];

export function SchemaFieldDialog({
  open,
  onOpenChange,
  field,
  existingKeys,
  onSave,
}: SchemaFieldDialogProps) {
  const [keyValue, setKeyValue] = useState("");
  const [type, setType] = useState<SchemaFieldType>("number");
  const [unit, setUnit] = useState("");
  const [sample, setSample] = useState("");
  const [required, setRequired] = useState(false);

  useEffect(() => {
    if (!open) return;
    setKeyValue(field?.key ?? "");
    setType(field?.type ?? "number");
    setUnit(field?.unit ?? "");
    setSample(field?.sample ?? "");
    setRequired(Boolean(field?.required));
  }, [field, open]);

  const keyError = useMemo(() => {
    const trimmed = keyValue.trim();
    if (!trimmed) return "Key is required.";
    const normalized = trimmed.toLowerCase();
    const keys = existingKeys.map((item) => item.toLowerCase());
    if (field?.key?.toLowerCase() === normalized) return "";
    if (keys.includes(normalized)) return "Key must be unique.";
    return "";
  }, [existingKeys, field?.key, keyValue]);

  const canSave = !keyError;

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      key: keyValue.trim(),
      type,
      unit: unit.trim() || undefined,
      sample: sample.trim() || undefined,
      required,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{field ? "Edit field" : "Add field"}</DialogTitle>
          <DialogDescription>Define the payload key and value type.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="schema-key">Key</Label>
              <Input
                id="schema-key"
                value={keyValue}
                onChange={(event) => setKeyValue(event.target.value)}
                placeholder="pressure"
              />
              <p className="text-xs text-muted-foreground">
                Use dot notation for nested fields (example: telemetry.pressure). Arrays use []
                (example: metrics[].value).
              </p>
              {keyError ? <p className="text-xs text-destructive">{keyError}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="schema-type">Type</Label>
              <select
                id="schema-type"
                value={type}
                onChange={(event) => setType(event.target.value as SchemaFieldType)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {FIELD_TYPES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="schema-unit">Unit (optional)</Label>
              <Input
                id="schema-unit"
                value={unit}
                onChange={(event) => setUnit(event.target.value)}
                placeholder="bar"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="schema-sample">Sample value (optional)</Label>
              <Input
                id="schema-sample"
                value={sample}
                onChange={(event) => setSample(event.target.value)}
                placeholder={type === "boolean" ? "true" : type === "number" ? "7.2" : "running"}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="schema-required"
              type="checkbox"
              className="h-4 w-4"
              checked={required}
              onChange={(event) => setRequired(event.target.checked)}
            />
            <Label htmlFor="schema-required">Required field</Label>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!canSave}>
            Save field
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
