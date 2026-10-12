import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import MobxProvider from "../src/features/provider/MobxProvider";
import AuthProvider from "../src/features/provider/AuthProvider";
import ToastProvider from "../src/features/provider/ToastProvider";
import { ConfirmProvider } from "@/src/hooks/useConfirm";
import SocketProvider from "@/src/features/provider/SocketProvider";
import LoadingProvider from "@/src/features/provider/LoadingProvider";

export const metadata: Metadata = {
  title: {
    default: "Task Management",
    template: "%s | Task Management",
  },
  description: "Quản lý công việc dễ dàng và hiệu quả.",
};
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <ToastProvider />

        <LoadingProvider>
          <MobxProvider>
            <ConfirmProvider>
              <AuthProvider>
                <SocketProvider>{children}</SocketProvider>
              </AuthProvider>
            </ConfirmProvider>
          </MobxProvider>
        </LoadingProvider>
      </body>
    </html>
  );
}
