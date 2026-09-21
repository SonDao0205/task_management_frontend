import type { Metadata } from "next";
import type { ReactNode } from "react";
import ToastProvider from "./ToastProvider";
import "./globals.css";
import MobxProvider from "./MobxProvider";

export const metadata: Metadata = {
  title: {
    default: "TaskFlow",
    template: "%s | TaskFlow",
  },
  description: "Quản lý công việc dễ dàng và hiệu quả.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <ToastProvider />
        <MobxProvider>{children}</MobxProvider>
      </body>
    </html>
  );
}
