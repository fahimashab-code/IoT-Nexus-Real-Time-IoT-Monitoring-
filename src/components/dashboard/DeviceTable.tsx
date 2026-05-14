"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp } from "lucide-react";
import { DeviceStatusBadge } from "@/components/devices/DeviceStatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { routeBuilders } from "@/config/routes";
import type { Device } from "@/types";

type SortKey = "name" | "status" | "location" | "battery";

interface DeviceTableProps {
  devices: Device[];
}

export function DeviceTable({ devices }: DeviceTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const sortedDevices = useMemo(() => {
    const list = [...devices];
    list.sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDir === "asc" ? aValue - bValue : bValue - aValue;
      }
      return sortDir === "asc"
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
    return list;
  }, [devices, sortKey, sortDir]);

  const paged = sortedDevices;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <button type="button" onClick={() => handleSort("name")} className="inline-flex items-center gap-1">
                Device
                {sortKey === "name" && (sortDir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
              </button>
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead>
              <button type="button" onClick={() => handleSort("location")} className="inline-flex items-center gap-1">
                Location
                {sortKey === "location" && (sortDir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
              </button>
            </TableHead>
            <TableHead>
              <button type="button" onClick={() => handleSort("battery")} className="inline-flex items-center gap-1">
                Battery
                {sortKey === "battery" && (sortDir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
              </button>
            </TableHead>
            <TableHead>Firmware</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paged.map((device) => (
            <TableRow key={device.id}>
              <TableCell className="font-medium">
                <Link href={routeBuilders.deviceDetails(device.id)} className="hover:underline">
                  {device.name}
                </Link>
              </TableCell>
              <TableCell>
                <DeviceStatusBadge status={device.status} />
              </TableCell>
              <TableCell>{device.location}</TableCell>
              <TableCell>{device.battery}%</TableCell>
              <TableCell>{device.firmware}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="text-sm text-muted-foreground">
        Showing {paged.length} device{paged.length === 1 ? "" : "s"}
      </div>
    </div>
  );
}
