"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "@/app/page.module.css";
import { useDashboard } from "../DashboardProvider";
import { Avatar, Icon } from "./ui";
import { useAuth } from "@/app/AuthProvider";
import { useConfirm } from "@/src/hooks/useConfirm";

function DashboardHeader() {
  const { user, logOut } = useAuth();
  const confirm = useConfirm();
  const pathname = usePathname();
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const currentUser = {
    initials:
      user?.name
        .split(" ")
        .filter(Boolean)
        .slice(-2)
        .map((part) => part[0]?.toUpperCase())
        .join("") || "U",
    color: "blue",
    name: user?.name ?? "Người dùng",
  };

  const handleLogout = async () => {
    const accepted = await confirm({
      variant: "warning",
      title: "Đăng xuất?",
      message: "Bạn có chắc chắn muốn kết thúc phiên đăng nhập hiện tại?",
      confirmText: "Đăng xuất",
      cancelText: "Quay lại",
    });
    if (!accepted) return;
    await logOut();
  };

  useEffect(() => {
    function closeMenu(event: MouseEvent) {
      if (!accountRef.current?.contains(event.target as Node))
        setAccountOpen(false);
    }
    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, []);

  const workspaceActive =
    pathname === "/" || pathname.startsWith("/workspace/");

  return (
    <header className={styles.appHeader}>
      <Link
        className={styles.brand}
        href="/"
        aria-label="Về danh sách workspace"
      >
        <span className={styles.brandLogo}>
          <Icon name="check" />
        </span>
        <span>Task Management</span>
      </Link>
      <nav className={styles.headerActions} aria-label="Điều hướng chính">
        <Link
          className={`${styles.navButton} ${workspaceActive ? styles.navActive : ""}`}
          href="/"
          aria-label="Workspace của tôi"
        >
          <Icon name="grid" size={21} />
          <span className={styles.tooltip}>Workspace của tôi</span>
        </Link>
        <Link
          className={`${styles.navButton} ${pathname === "/my-tasks" ? styles.navActive : ""}`}
          href="/my-tasks"
          aria-label="Nhiệm vụ của tôi"
        >
          <Icon name="check" size={22} />
          <span className={styles.tooltip}>Nhiệm vụ của tôi</span>
        </Link>
        <div
          ref={accountRef}
          className={`${styles.accountBox} ${accountOpen ? styles.accountOpen : ""}`}
        >
          <button
            className={styles.accountTrigger}
            onClick={() => setAccountOpen((open) => !open)}
            aria-expanded={accountOpen}
          >
            <Avatar person={currentUser} />
            <span className={styles.userName}>{user?.name}</span>
            <span className={styles.accountChevron}>
              <Icon name="chevron" size={16} />
            </span>
          </button>
          {accountOpen && (
            <div className={styles.accountMenu}>
              <div className={styles.accountMenuHead}>
                <Avatar person={currentUser} />
                <span>
                  <strong>{user?.name}</strong>
                  <small>{user?.email}</small>
                </span>
              </div>
              <Link
                className={styles.menuItem}
                href="/profile"
                onClick={() => setAccountOpen(false)}
              >
                <Icon name="user" size={18} /> Xem thông tin tài khoản
              </Link>
              <button
                className={`${styles.menuItem} ${styles.logout}`}
                onClick={() => {
                  setAccountOpen(false);
                  void handleLogout();
                }}
              >
                <Icon name="logout" size={18} /> Đăng xuất
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

export function DashboardFrame({ children }: { children: ReactNode }) {
  const { toast } = useDashboard();
  return (
    <div className={styles.appShell}>
      <DashboardHeader />
      <main className={styles.layout}>{children}</main>
      {toast && (
        <div className={styles.toast} role="status">
          <span>✓</span>
          {toast}
        </div>
      )}
    </div>
  );
}
