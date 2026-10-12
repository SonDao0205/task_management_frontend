"use client";

import styles from "@/app/page.module.css";
import { priorityMeta, type Task } from "../../types";
import { AvatarStack } from "../workspace";

export function TaskRow({
  task,
  onOpen,
  onOpenComments,
}: {
  task: Task;
  onOpen: (task: Task) => void;
  onOpenComments?: (task: Task) => void;
}) {
  return (
    <div className={styles.taskRow}>
      <span className={styles.taskMain}>
        <button className={styles.taskOpenButton} onClick={() => onOpen(task)}>
          <strong>{task.title}</strong>
          <small>{task.description}</small>
        </button>
      </span>
      <span
        className={`${styles.priority} ${styles[`priority${task.priority}`]}`}
      >
        <i /> {priorityMeta[task.priority]}
      </span>
      <span className={styles.taskDate}>
        <small>Bắt đầu</small>
        {task.startAt}
      </span>
      <span className={styles.taskDate}>
        <small>Deadline</small>
        {task.deadline}
      </span>
      <span className={styles.taskAssignees}>
        {task.tag ? (
          <span className={`${styles.badge} ${styles.badgeOwner}`}>
            {task.tag}
          </span>
        ) : (
          task.assignees.length ? (
            <AvatarStack
              members={task.assignees}
              total={task.assignees.length}
              limit={3}
            />
          ) : (
            <small>Chưa giao</small>
          )
        )}
      </span>
      <button
        type="button"
        className={styles.taskCommentButton}
        aria-label={`Xem bình luận của ${task.title}`}
        title="Bình luận"
        onClick={(event) => {
          event.stopPropagation();
          (onOpenComments ?? onOpen)(task);
        }}
      >
        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5 8 8 0 0 1-3.6-.85L4 20l1.35-4.1A7.5 7.5 0 1 1 20 11.5Z" />
          <path d="M8 11.5h.01M12 11.5h.01M16 11.5h.01" />
        </svg>
        <span>2</span>
      </button>
    </div>
  );
}
