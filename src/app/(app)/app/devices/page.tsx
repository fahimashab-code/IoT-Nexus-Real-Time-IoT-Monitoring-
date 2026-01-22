"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { DeviceTable } from "@/components/dashboard/DeviceTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { getDevices } from "@/services/mockData";
import type { Device } from "@/types";
import { deviceSchema, type DeviceFormValues } from "@/lib/validators";

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>(() => getDevices());
  const [open, setOpen] = useState(false);
  const form = useForm<DeviceFormValues>({
    resolver: zodResolver(deviceSchema),
    defaultValues: {
      name: "",
      location: "",
      status: "online",
      firmware: "v1.0.0",
      battery: 100,
    },
  });

  const onSubmit = (values: DeviceFormValues) => {
    const now = new Date().toISOString();
    const device: Device = {
      id: `dev-${Date.now()}`,
      name: values.name,
      location: values.location,
      status: values.status,
      firmware: values.firmware,
      battery: values.battery,
      lastSeen: now,
      statusSince: now,
    };

    setDevices((prev) => [device, ...prev]);
    toast({
      title: "Device added",
      description: `${values.name} is now in the fleet list.`,
    });
    setOpen(false);
    form.reset();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Devices</h1>
          <p className="text-sm text-muted-foreground">
            Track device status, firmware, and battery health across the fleet.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>Add device</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Fleet Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <DeviceTable devices={devices} />
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Register a device</DialogTitle>
            <DialogDescription>
              Add a new device to the fleet for monitoring and alerting.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Device name</FormLabel>
                    <FormControl>
                      <Input placeholder="Sensor Node 21" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Warehouse A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <option value="online">Online</option>
                          <option value="warning">Warning</option>
                          <option value="offline">Offline</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="battery"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Battery (%)</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} max={100} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="firmware"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Firmware version</FormLabel>
                    <FormControl>
                      <Input placeholder="v1.2.0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save device</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
