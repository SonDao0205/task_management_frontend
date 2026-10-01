"use client";

import type { ReactNode } from "react";
import styles from "@/app/page.module.css";
import { Icon } from "../ui";

export function Modal({
  title,
  subtitle,
  children,
  onClose,
  danger = false,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onClose: () => void;
  danger?: boolean;
}) {
  return (
    <div
      className={styles.modalBackdrop}
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className={styles.modalHeader}>
          <span
            className={`${styles.modalIcon} ${danger ? styles.modalIconDanger : ""}`}
          >
            <Icon name={danger ? "alert" : "folder"} />
          </span>
          <div>
            <h2 id="modal-title">{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Đóng"
          >
            <Icon name="close" size={19} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
