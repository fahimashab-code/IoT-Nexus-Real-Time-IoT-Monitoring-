import { notFound } from "next/navigation";
import { DeviceDetailView } from "@/components/dashboard/DeviceDetailView";
import { getDeviceById } from "@/services/mockData";

interface DeviceDetailPageProps {
  params: Promise<{
    deviceId: string;
  }>;
}

export default async function DeviceDetailPage({ params }: DeviceDetailPageProps) {
  const { deviceId } = await params;
  const device = getDeviceById(deviceId);

  if (!device) {
    notFound();
  }

  return <DeviceDetailView device={device} />;
}
