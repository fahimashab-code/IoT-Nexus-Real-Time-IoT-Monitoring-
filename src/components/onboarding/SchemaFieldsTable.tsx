"use client";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { DeviceSchemaField } from "@/lib/onboarding/types";

type SchemaFieldsTableProps = {
  fields: DeviceSchemaField[];
  onEdit: (field: DeviceSchemaField) => void;
  onRemove: (key: string) => void;
  readOnly?: boolean;
};

export function SchemaFieldsTable({ fields, onEdit, onRemove, readOnly = false }: SchemaFieldsTableProps) {
  if (fields.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
        No schema fields yet. Add fields to define your payload.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Key</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Required</TableHead>
          <TableHead>Unit</TableHead>
          <TableHead>Sample</TableHead>
          {!readOnly ? <TableHead className="text-right">Actions</TableHead> : null}
        </TableRow>
      </TableHeader>
      <TableBody>
        {fields.map((field) => (
          <TableRow key={field.key}>
            <TableCell className="font-medium">{field.key}</TableCell>
            <TableCell>{field.type}</TableCell>
            <TableCell>{field.required ? "Yes" : "No"}</TableCell>
            <TableCell>{field.unit || "-"}</TableCell>
            <TableCell>{field.sample || "-"}</TableCell>
            {!readOnly ? (
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => onEdit(field)}>
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onRemove(field.key)}>
                    Remove
                  </Button>
                </div>
              </TableCell>
            ) : null}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
