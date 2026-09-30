"use client";

import type { ReactNode } from "react";
import styles from "@/app/page.module.css";
import { priorityMeta, statusMeta } from "../mock-data";
import type { AvatarData, StatusKey, Task } from "../types";

export function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  const paths: Record<string, ReactNode> = {
    check: (
      <>
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </>
    ),
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    logout: (
      <>
        <path d="M10 17l5-5-5-5" />
        <path d="M15 12H3" />
        <path d="M21 19V5a2 2 0 0 0-2-2h-6" />
      </>
    ),
    chevron: <path d="M6 9l6 6 6-6" />,
    plus: (
      <>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.5-3.5" />
      </>
    ),
    edit: (
      <>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z" />
      </>
    ),
    trash: (
      <>
        <path d="M3 6h18" />
        <path d="M8 6V4h8v2" />
        <path d="M19 6l-1 14H6L5 6" />
      </>
    ),
    arrow: (
      <>
        <path d="M19 12H5" />
        <path d="M12 19l-7-7 7-7" />
      </>
    ),
    addUser: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M19 8v6M22 11h-6" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </>
    ),
    folder: (
      <>
        <path d="M3 7h18" />
        <path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
      </>
    ),
    lock: (
      <>
        <rect x="4" y="10" width="16" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),
    close: (
      <>
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </>
    ),
    alert: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v5M12 16h.01" />
      </>
    ),
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
        <path d="M20 8v6M23 11h-6" />
      </>
    ),
  };
  return <svg {...common}>{paths[name]}</svg>;
}

export function Avatar({
  person,
  size = "medium",
}: {
  person: AvatarData;
  size?: "small" | "medium" | "large";
}) {
  const sizeName = `avatar${size[0].toUpperCase()}${size.slice(1)}`;
  return (
    <span
      className={`${styles.avatar} ${styles[sizeName]} ${styles[`avatar${person.color}`]}`}
      title={person.name}
    >
      {person.initials}
    </span>
  );
}

export function AvatarStack({
  members,
  total,
}: {
  members: AvatarData[];
  total: number;
}) {
  const rest = Math.max(0, total - members.length);
  return (
    <div className={styles.avatarStack}>
      {members.map((member, index) => (
        <Avatar
          key={`${member.initials}-${index}`}
          person={member}
          size="small"
        />
      ))}
      {rest > 0 && <span className={styles.avatarMore}>+{rest}</span>}
    </div>
  );
}

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

export function EmptyState({ message }: { message: string }) {
  return (
    <div className={styles.emptyState}>
      <span>
        <Icon name="search" size={24} />
      </span>
      <strong>Không tìm thấy kết quả</strong>
      <p>{message}</p>
    </div>
  );
}

export function TaskRow({
  task,
  onOpen,
}: {
  task: Task;
  onOpen: (task: Task) => void;
}) {
  return (
    <button className={styles.taskRow} onClick={() => onOpen(task)}>
      <span className={styles.taskMain}>
        <strong>{task.title}</strong>
        <small>{task.description}</small>
      </span>
      <span
        className={`${styles.priority} ${styles[`priority${task.priority}`]}`}
      >
        <i /> {priorityMeta[task.priority]}
      </span>
      <span className={styles.deadline}>{task.deadline}</span>
      <span>
        {task.tag ? (
          <span className={`${styles.badge} ${styles.badgeOwner}`}>
            {task.tag}
          </span>
        ) : (
          <Avatar person={task.assignee} size="small" />
        )}
      </span>
      <span className={styles.taskId}>#{task.id}</span>
    </button>
  );
}

export function StatusSection({
  status,
  tasks,
  open,
  onToggle,
  onOpenTask,
}: {
  status: StatusKey;
  tasks: Task[];
  open: boolean;
  onToggle: () => void;
  onOpenTask: (task: Task) => void;
}) {
  return (
    <section
      className={`${styles.card} ${styles.statusSection} ${open ? styles.sectionOpen : ""}`}
    >
      <button
        className={styles.statusHeader}
        onClick={onToggle}
        aria-expanded={open}
      >
        <span className={styles.statusLeft}>
          <span className={styles.rotateIcon}>
            <Icon name="chevron" size={17} />
          </span>
          <i className={`${styles.statusDot} ${styles[status]}`} />
          {statusMeta[status].label}
          <small>{tasks.length} task</small>
        </span>
      </button>
      {open && (
        <div className={styles.taskList}>
          {tasks.length ? (
            tasks.map((task) => (
              <TaskRow task={task} key={task.id} onOpen={onOpenTask} />
            ))
          ) : (
            <p className={styles.miniEmpty}>
              Chưa có nhiệm vụ trong trạng thái này.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

export function TaskDetailModal({
  task,
  onClose,
}: {
  task: Task;
  onClose: () => void;
}) {
  return (
    <Modal
      title={task.title}
      subtitle={`#${task.id} · ${statusMeta[task.status].label}`}
      onClose={onClose}
    >
      <div className={styles.taskDetail}>
        <div className={styles.taskDetailDescription}>
          <span>Mô tả</span>
          <p>{task.description}</p>
        </div>
        <div className={styles.taskDetailGrid}>
          <div>
            <span>Độ ưu tiên</span>
            <strong
              className={`${styles.priority} ${styles[`priority${task.priority}`]}`}
            >
              <i /> {priorityMeta[task.priority]}
            </strong>
          </div>
          <div>
            <span>Thời hạn</span>
            <strong>{task.deadline}</strong>
          </div>
          <div>
            <span>Người phụ trách</span>
            <strong className={styles.assignee}>
              <Avatar person={task.assignee} size="small" />
              {task.assignee.name}
            </strong>
          </div>
          <div>
            <span>Trạng thái</span>
            <strong>{statusMeta[task.status].label}</strong>
          </div>
        </div>
        <div className={styles.modalActions}>
          <button
            className={`${styles.button} ${styles.primaryButton}`}
            onClick={onClose}
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </Modal>
  );
}
