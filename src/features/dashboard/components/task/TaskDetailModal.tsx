"use client";

import { useState, type FormEvent } from "react";
import styles from "@/app/page.module.css";
import {
  priorityMeta,
  statusKeys,
  statusMeta,
  type StatusKey,
  type Task,
  type WorkspaceMember,
} from "../../types";
import { Modal } from "../modal";
import { Avatar } from "../ui";

type TaskUpdate = {
  status: StatusKey;
  memberIds?: string[];
};

export function TaskDetailModal({
  task,
  onClose,
  members = [],
  canManageAssignees = false,
  canUpdateStatus = false,
  submitting = false,
  onUpdate,
}: {
  task: Task;
  onClose: () => void;
  members?: WorkspaceMember[];
  canManageAssignees?: boolean;
  canUpdateStatus?: boolean;
  submitting?: boolean;
  onUpdate?: (update: TaskUpdate) => Promise<boolean>;
}) {
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(
    task.memberIds,
  );
  const [status, setStatus] = useState<StatusKey>(task.status);

  async function submitUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!onUpdate || (!canManageAssignees && !canUpdateStatus)) return;

    const success = await onUpdate({
      status,
      memberIds: canManageAssignees ? selectedMemberIds : undefined,
    });
    if (success) onClose();
  }

  function toggleMember(memberId: string, checked: boolean) {
    setSelectedMemberIds((current) =>
      checked
        ? [...new Set([...current, memberId])]
        : current.filter((id) => id !== memberId),
    );
  }

  return (
    <Modal title={task.title} subtitle={`#${task.id}`} onClose={onClose}>
      <form className={styles.taskDetail} onSubmit={submitUpdate}>
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
              {priorityMeta[task.priority]}
            </strong>
          </div>
          <div>
            <span>Ngày bắt đầu</span>
            <strong>{task.startAt}</strong>
          </div>
          <div>
            <span>Deadline</span>
            <strong>{task.deadline}</strong>
          </div>
          <label className={styles.taskStatusField}>
            <span>Trạng thái</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as StatusKey)}
              disabled={!canUpdateStatus || submitting}
            >
              {statusKeys.map((statusKey) => (
                <option
                  key={statusKey}
                  value={statusKey}
                  disabled={statusKey === "done" && !canManageAssignees}
                >
                  {statusMeta[statusKey].label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className={styles.taskMemberSection}>
          <span>Thành viên workspace</span>
          <div className={styles.taskMemberChecklist}>
            {members.map((member) => (
              <label className={styles.taskMemberOption} key={member.id}>
                <input
                  type="checkbox"
                  checked={selectedMemberIds.includes(member.id)}
                  disabled={
                    !canManageAssignees ||
                    submitting ||
                    (member.status !== "active" &&
                      !selectedMemberIds.includes(member.id))
                  }
                  onChange={(event) =>
                    toggleMember(member.id, event.target.checked)
                  }
                />
                <Avatar person={member} size="small" />
                <span>
                  <strong>{member.name}</strong>
                  <small>
                    {member.email} · {member.role}
                    {member.status !== "active" ? ` · ${member.status}` : ""}
                  </small>
                </span>
              </label>
            ))}
            {!members.length && <p>Workspace chưa có thành viên hoạt động.</p>}
          </div>
        </div>

        <div className={styles.taskMemberSection}>
          <span>Người phụ trách hiện tại</span>
          <div className={styles.assigneeList}>
            {task.assignees.map((assignee) => (
              <div className={styles.assigneeListItem} key={assignee.memberId}>
                <Avatar person={assignee} size="small" />
                <span>
                  <strong>{assignee.name}</strong>
                  <small>{assignee.email}</small>
                </span>
              </div>
            ))}
            {!task.assignees.length && (
              <p>Task chưa được giao cho thành viên.</p>
            )}
          </div>
        </div>

        <div className={styles.modalActions}>
          <button
            type="button"
            className={`${styles.button} ${styles.cancelButton}`}
            onClick={onClose}
            disabled={submitting}
          >
            Hủy
          </button>
          <button
            type="submit"
            className={`${styles.button} ${styles.primaryButton}`}
            disabled={submitting || (!canManageAssignees && !canUpdateStatus)}
          >
            {submitting ? "Đang cập nhật..." : "Cập nhật"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
