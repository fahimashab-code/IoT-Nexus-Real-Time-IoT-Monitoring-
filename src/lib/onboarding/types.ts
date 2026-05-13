export type SchemaFieldType = "number" | "boolean" | "string";

export type DeviceSchemaField = {
  key: string;
  type: SchemaFieldType;
  unit?: string;
  required?: boolean;
  sample?: string;
};

export type OnboardedDevice = {
  id: string;
  name: string;
  location?: string;
  endpoint?: string;
  firmware?: string;
  topicPattern: string;
  schema: DeviceSchemaField[];
  createdAt: string;
};
