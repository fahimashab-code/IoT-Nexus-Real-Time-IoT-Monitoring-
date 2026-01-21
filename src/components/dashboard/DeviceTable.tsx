"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { routeBuilders } from "@/config/routes";
import { getDevices } from "@/services/mockData";
import type { Device } from "@/types";

const PAGE_SIZE = 8;

type SortKey = "name" | "status" | "location" | "battery";

export function DeviceTable() {
  const devices = getDevices();
  const [page, setPage] = useState(1);
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

  const totalPages = Math.ceil(sortedDevices.length / PAGE_SIZE);
  const paged = sortedDevices.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const statusClasses: Record<Device["status"], string> = {
    online: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    warning: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    offline: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
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
                <Badge variant="outline" className={statusClasses[device.status]}>
                  {device.status}
                </Badge>
              </TableCell>
              <TableCell>{device.location}</TableCell>
              <TableCell>{device.battery}%</TableCell>
              <TableCell>{device.firmware}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Page {page} of {totalPages}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
