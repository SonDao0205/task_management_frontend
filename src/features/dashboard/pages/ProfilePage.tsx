"use client";

import { FormEvent, useState } from "react";
import styles from "@/app/page.module.css";
import { Modal } from "../components/modal";
import { Avatar, Icon } from "../components/ui";
import { useAuth } from "@/app/AuthProvider";
import { UserStatus } from "@/src/types/user.types";
import { useStore } from "@/app/MobxProvider";
import { toast } from "@/src/common/toast";

export default function ProfilePage() {
  const { user } = useAuth();
  const { authStore } = useStore();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const currentPassword = String(data.get("currentPassword") ?? "");
    const newPassword = String(data.get("newPassword") ?? "");
    const confirmPassword = String(data.get("confirmPassword") ?? "");

    if (newPassword !== confirmPassword) {
      toast.error("Xác nhận mật khẩu mới không trùng khớp!");
      return;
    }

    setChangingPassword(true);
    try {
      const success = await authStore.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      if (success) {
        form.reset();
        setChangePasswordOpen(false);
      }
    } finally {
      setChangingPassword(false);
    }
  }

  const avatar = {
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

  const joinedAt = user?.created_at
    ? new Intl.DateTimeFormat("vi-VN").format(new Date(user.created_at))
    : "—";

  return (
    <section className={styles.page}>
      <div className={styles.pageHead}>
        <div>
          <span className={styles.eyebrow}>Tài khoản</span>
          <h1>Hồ sơ cá nhân</h1>
          <p>Xem thông tin cơ bản và quản lý bảo mật tài khoản.</p>
        </div>
      </div>
      <div className={styles.profileGrid}>
        <aside className={`${styles.card} ${styles.profileSummary}`}>
          <div className={styles.profileCover} />
          <div className={styles.bigAvatar}>
            <Avatar person={avatar} size="large" />
          </div>
          <h2>{user?.name}</h2>
          <span className={styles.activeStatus}>
            <i />{" "}
            {user?.status === UserStatus.ACTIVE
              ? "Đang hoạt động"
              : user?.status === UserStatus.IN_ACTIVE
                ? "Ngừng hoạt động"
                : "Bị cấm"}
          </span>
          <button
            className={`${styles.button} ${styles.primaryButton} ${styles.fullButton}`}
            onClick={() => setChangePasswordOpen(true)}
          >
            <Icon name="lock" size={17} /> Đổi mật khẩu
          </button>
        </aside>
        <section className={`${styles.card} ${styles.profileDetail}`}>
          <div className={styles.sectionHeading}>
            <div>
              <h2>Thông tin cơ bản</h2>
              <p>Thông tin tài khoản được hiển thị trong các workspace.</p>
            </div>
            <span className={styles.verifiedBadge}>✓ Đã xác thực</span>
          </div>
          <div className={styles.infoGrid}>
            {[
              ["Họ và tên", user?.name],
              ["Email", user?.email],
              ["Số điện thoại", user?.phone],
              ["Vai trò hệ thống", "User"],
              ["Ngày tham gia", joinedAt],
              ["Múi giờ", "GMT+7 · Việt Nam"],
            ].map(([label, value]) => (
              <div className={styles.infoItem} key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>
      {changePasswordOpen && (
        <Modal
          title="Đổi mật khẩu"
          subtitle="Mật khẩu nên có ít nhất 8 ký tự."
          onClose={() => setChangePasswordOpen(false)}
        >
          <form className={styles.modalForm} onSubmit={changePassword}>
            <label>
              Mật khẩu hiện tại
              <input
                name="currentPassword"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </label>
            <label>
              Mật khẩu mới
              <input
                type="password"
                name="newPassword"
                placeholder="Tối thiểu 8 ký tự"
                minLength={8}
                maxLength={50}
                autoComplete="new-password"
                required
              />
            </label>
            <label>
              Xác nhận mật khẩu mới
              <input
                type="password"
                name="confirmPassword"
                placeholder="Nhập lại mật khẩu mới"
                minLength={8}
                maxLength={50}
                autoComplete="new-password"
                required
              />
            </label>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={`${styles.button} ${styles.cancelButton}`}
                onClick={() => setChangePasswordOpen(false)}
              >
                Hủy
              </button>
              <button
                className={`${styles.button} ${styles.primaryButton}`}
                disabled={changingPassword}
              >
                {changingPassword ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}
