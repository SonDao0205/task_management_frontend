"use client";

import styles from "@/app/page.module.css";
import { priorityMeta, type Task } from "../../types";
import { AvatarStack } from "../workspace";

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
    </button>
  );
}
