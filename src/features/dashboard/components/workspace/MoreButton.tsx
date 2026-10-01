"use client";

import styles from "@/app/page.module.css";
import { Icon } from "../ui";

export function MoreButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      className={styles.moreButton}
      onClick={onClick}
      aria-label="Xem tất cả thành viên"
      title="Xem tất cả thành viên"
    >
      <Icon name="more" size={20} />
    </button>
  );
}
