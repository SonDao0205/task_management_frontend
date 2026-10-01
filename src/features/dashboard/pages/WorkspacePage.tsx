"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import styles from "@/app/page.module.css";
import { useAuth } from "@/app/AuthProvider";
import { useConfirm } from "@/src/hooks/useConfirm";
import { useDashboard } from "../DashboardProvider";
import {
  statusKeys,
  type ApiRole,
  type Priority,
  type StatusKey,
  type Task,
  type WorkspaceMember,
} from "../types";
import { Modal } from "../components/modal";
import { StatusSection, TaskDetailModal } from "../components/task";
import { Avatar, EmptyState, Icon } from "../components/ui";
import { AvatarStack, MoreButton } from "../components/workspace";

type WorkspaceModal = "add-task" | "add-member" | "members" | null;

function minimumDateTime() {
  const date = new Date(Date.now() + 5 * 60 * 1000);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

export default function WorkspacePage({
  workspaceId,
}: {
  workspaceId: string;
}) {
  const confirm = useConfirm();
  const { user } = useAuth();
  const {
    workspace,
    tasks,
    loadingWorkspace,
    submitting,
    loadWorkspace,
    addTask,
    addMember,
    updateMember,
    deleteMember,
    updateTask,
  } = useDashboard();
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<WorkspaceModal>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [openStatuses, setOpenStatuses] = useState<Record<StatusKey, boolean>>({
    todo: true,
    progress: false,
    review: false,
    done: false,
  });

  useEffect(() => {
    void loadWorkspace(workspaceId);
  }, [loadWorkspace, workspaceId]);

  const currentWorkspace = workspace?.id === workspaceId ? workspace : null;
  const canManageWorkspace = currentWorkspace?.role === "Owner";
  const canManageTasks =
    currentWorkspace?.role === "Owner" || currentWorkspace?.role === "Master";
  const filteredTasks = useMemo(
    () =>
      tasks.filter((task) =>
        task.title
          .toLocaleLowerCase("vi")
          .includes(search.toLocaleLowerCase("vi").trim()),
      ),
    [search, tasks],
  );

  async function submitTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const status = String(data.get("status")) as StatusKey;
    const success = await addTask(workspaceId, {
      title: String(data.get("title") ?? "").trim(),
      description: String(data.get("description") ?? "").trim(),
      priority: String(data.get("priority")) as Priority,
      status,
      startAt: String(data.get("startAt") ?? ""),
      endAt: String(data.get("endAt") ?? ""),
      memberIds: data.getAll("memberIds").map(String),
    });
    if (success) {
      setOpenStatuses((current) => ({ ...current, [status]: true }));
      setModal(null);
    }
  }

  async function submitMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const role = String(data.get("role")) as ApiRole;
    if (email && (await addMember(workspaceId, email, role))) setModal(null);
  }

  async function submitMemberRole(
    event: FormEvent<HTMLFormElement>,
    member: WorkspaceMember,
  ) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const role = String(data.get("role")) as ApiRole;
    await updateMember(workspaceId, member.id, role, member.status);
  }

  async function removeMember(member: WorkspaceMember) {
    const confirmed = await confirm({
      variant: "delete",
      title: "Xóa thành viên",
      message: `Bạn có chắc muốn xóa ${member.name} khỏi workspace?`,
      confirmText: "Xóa thành viên",
    });
    if (!confirmed) return;
    await deleteMember(workspaceId, member.id);
  }

  if (loadingWorkspace && !currentWorkspace) {
    return <section className={styles.page}>Đang tải workspace...</section>;
  }

  if (!currentWorkspace) {
    return (
      <section className={`${styles.card} ${styles.standaloneEmpty}`}>
        <EmptyState message="Workspace này không tồn tại hoặc bạn không có quyền truy cập." />
        <div className={styles.notFoundAction}>
          <Link className={`${styles.button} ${styles.primaryButton}`} href="/">
            Quay lại trang chủ
          </Link>
        </div>
      </section>
    );
  }

  const activeMembers = currentWorkspace.members.filter(
    (member) => member.status === "active",
  );
  const minDate = minimumDateTime();

  return (
    <section className={styles.page}>
      <div className={`${styles.card} ${styles.workspaceHeader}`}>
        <div className={styles.workspaceInfo}>
          <Link className={styles.backButton} href="/" title="Quay lại">
            <Icon name="arrow" size={19} />
          </Link>
          <div className={styles.workspaceMark}>
            {currentWorkspace.name.slice(0, 1)}
          </div>
          <div className={styles.workspaceMeta}>
            <span>Workspace · {currentWorkspace.role}</span>
            <h1>{currentWorkspace.name}</h1>
            <p>{currentWorkspace.description || "Chưa có mô tả."}</p>
          </div>
        </div>
        <div className={styles.workspaceRight}>
          <MoreButton onClick={() => setModal("members")} />
          <AvatarStack
            members={currentWorkspace.members}
            total={currentWorkspace.memberCount}
            limit={3}
          />
          {canManageWorkspace && (
            <button
              className={`${styles.button} ${styles.softButton}`}
              onClick={() => setModal("add-member")}
            >
              <Icon name="addUser" size={17} /> Thêm thành viên
            </button>
          )}
        </div>
      </div>

      <div className={styles.toolbar}>
        <label className={styles.searchWrap}>
          <Icon name="search" size={18} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm kiếm task trong workspace..."
          />
          <span className={styles.srOnly}>Tìm nhiệm vụ</span>
        </label>
        {canManageTasks && (
          <button
            className={`${styles.button} ${styles.primaryButton}`}
            onClick={() => setModal("add-task")}
          >
            <Icon name="plus" size={17} /> Thêm task
          </button>
        )}
      </div>

      {statusKeys.map((status) => (
        <StatusSection
          key={status}
          status={status}
          tasks={filteredTasks.filter((task) => task.status === status)}
          open={openStatuses[status]}
          onToggle={() =>
            setOpenStatuses((current) => ({
              ...current,
              [status]: !current[status],
            }))
          }
          onOpenTask={setSelectedTask}
        />
      ))}

      {modal === "add-task" && (
        <Modal
          title="Thêm nhiệm vụ mới"
          subtitle={`Tạo task trong ${currentWorkspace.name}.`}
          onClose={() => setModal(null)}
        >
          <form className={styles.modalForm} onSubmit={submitTask}>
            <label>
              Tiêu đề
              <input
                name="title"
                placeholder="Nhập tên nhiệm vụ"
                autoFocus
                required
              />
            </label>
            <label>
              Mô tả
              <textarea
                name="description"
                placeholder="Mô tả kết quả cần hoàn thành..."
                rows={3}
                required
              />
            </label>
            <div className={styles.formGrid}>
              <label>
                Trạng thái
                <select name="status">
                  <option value="todo">To Do</option>
                  <option value="progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                </select>
              </label>
              <label>
                Độ ưu tiên
                <select name="priority">
                  <option value="medium">Trung bình</option>
                  <option value="high">Cao</option>
                  <option value="low">Thấp</option>
                </select>
              </label>
            </div>
            <div className={styles.formGrid}>
              <label>
                Bắt đầu
                <input
                  name="startAt"
                  type="datetime-local"
                  min={minDate}
                  required
                />
              </label>
              <label>
                Kết thúc
                <input
                  name="endAt"
                  type="datetime-local"
                  min={minDate}
                  required
                />
              </label>
            </div>
            <label>Giao cho thành viên</label>
            <div className={styles.memberChoices}>
              {activeMembers.map((member) => (
                <label className={styles.memberChoice} key={member.id}>
                  <input type="checkbox" name="memberIds" value={member.id} />
                  {member.name} · {member.role}
                </label>
              ))}
              {!activeMembers.length && (
                <span>Workspace chưa có thành viên.</span>
              )}
            </div>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={`${styles.button} ${styles.cancelButton}`}
                onClick={() => setModal(null)}
              >
                Hủy
              </button>
              <button
                className={`${styles.button} ${styles.primaryButton}`}
                disabled={submitting}
              >
                <Icon name="plus" size={17} /> Thêm task
              </button>
            </div>
          </form>
        </Modal>
      )}

      {modal === "add-member" && (
        <Modal
          title="Thêm thành viên"
          subtitle="Thêm tài khoản đã đăng ký vào workspace qua email."
          onClose={() => setModal(null)}
        >
          <form className={styles.modalForm} onSubmit={submitMember}>
            <label>
              Email thành viên
              <input
                name="email"
                type="email"
                placeholder="name@company.com"
                autoFocus
                required
              />
            </label>
            <label>
              Vai trò
              <select name="role" defaultValue="member">
                <option value="member">Member</option>
                <option value="master">Master</option>
              </select>
            </label>
            <div className={styles.inviteNote}>
              <Icon name="users" size={18} /> Master được tạo và giao task;
              Member chỉ làm việc với task được giao.
            </div>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={`${styles.button} ${styles.cancelButton}`}
                onClick={() => setModal(null)}
              >
                Hủy
              </button>
              <button
                className={`${styles.button} ${styles.primaryButton}`}
                disabled={submitting}
              >
                Thêm thành viên
              </button>
            </div>
          </form>
        </Modal>
      )}

      {modal === "members" && (
        <Modal
          title="Thành viên workspace"
          subtitle={`${currentWorkspace.memberCount} thành viên trong ${currentWorkspace.name}.`}
          onClose={() => setModal(null)}
        >
          <div className={styles.memberList}>
            {currentWorkspace.members.map((member) => {
              const isOwner = member.role === "Owner";

              return (
                <div className={styles.memberListRow} key={member.id}>
                  <div className={styles.memberIdentity}>
                    <Avatar person={member} />
                    <span>
                      <strong>{member.name}</strong>
                      <small>{member.email}</small>
                    </span>
                  </div>

                  {canManageWorkspace && !isOwner ? (
                    <form
                      className={styles.memberActions}
                      onSubmit={(event) => submitMemberRole(event, member)}
                    >
                      <select
                        name="role"
                        defaultValue={member.role.toLowerCase()}
                        aria-label={`Vai trò của ${member.name}`}
                      >
                        <option value="member">Member</option>
                        <option value="master">Master</option>
                      </select>
                      <button
                        type="submit"
                        className={`${styles.button} ${styles.softButton}`}
                        disabled={submitting}
                      >
                        Cập nhật
                      </button>
                      <button
                        type="button"
                        className={`${styles.iconButton} ${styles.dangerIcon}`}
                        onClick={() => void removeMember(member)}
                        disabled={submitting}
                        aria-label={`Xóa ${member.name}`}
                        title="Xóa thành viên"
                      >
                        <Icon name="trash" size={17} />
                      </button>
                    </form>
                  ) : (
                    <span
                      className={`${styles.badge} ${styles[`badge${member.role}`]}`}
                    >
                      {member.role}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </Modal>
      )}

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          members={currentWorkspace.members}
          canManageAssignees={Boolean(canManageTasks)}
          canUpdateStatus={
            Boolean(canManageTasks) ||
            selectedTask.assignees.some(
              (assignee) => assignee.userId === user?.id,
            )
          }
          submitting={submitting}
          onUpdate={({ status, memberIds }) =>
            updateTask(selectedTask, status, memberIds)
          }
          onClose={() => setSelectedTask(null)}
        />
      )}
    </section>
  );
}
