import type { ReactNode } from "react";
import { DashboardFrame } from "@/src/features/dashboard/components/DashboardFrame";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardFrame>{children}</DashboardFrame>;
}
