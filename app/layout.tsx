import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import MobxProvider from "./MobxProvider";
import AuthProvider from "./AuthProvider";
import ToastProvider from "./ToastProvider";

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

        <MobxProvider>
          <AuthProvider>{children}</AuthProvider>
        </MobxProvider>
      </body>
    </html>
  );
}
