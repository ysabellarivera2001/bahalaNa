import { activityLogs } from "@/data/mockData";
import { ActivityLog } from "@/types";

function pause(ms = 180): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getActivityLogs(): Promise<ActivityLog[]> {
  await pause();
  return activityLogs;
}
