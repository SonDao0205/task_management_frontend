import type { ReactNode } from "react";
import { DashboardProvider } from "@/src/features/dashboard/DashboardProvider";
import { DashboardFrame } from "@/src/features/dashboard/components/DashboardFrame";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardProvider><DashboardFrame>{children}</DashboardFrame></DashboardProvider>;
}
