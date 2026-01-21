import { DeviceTable } from "@/components/dashboard/DeviceTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DevicesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Devices</h1>
        <p className="text-sm text-muted-foreground">
          Track device status, firmware, and battery health across the fleet.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Fleet Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <DeviceTable />
        </CardContent>
      </Card>
    </div>
  );
}
