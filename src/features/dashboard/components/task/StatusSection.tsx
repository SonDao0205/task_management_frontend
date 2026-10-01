"use client";

import styles from "@/app/page.module.css";
import { statusMeta, type StatusKey, type Task } from "../../types";
import { Icon } from "../ui";
import { TaskRow } from "./TaskRow";

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
