"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import styles from "@/app/page.module.css";
import { useConfirm } from "@/src/hooks/useConfirm";
import { useDashboard } from "../DashboardProvider";
import type { Workspace } from "../types";
import { Modal } from "../components/modal";
import { EmptyState, Icon } from "../components/ui";
import { AvatarStack } from "../components/workspace";

type WorkspaceModal = "add" | "edit" | null;

export default function HomePage() {
  const confirm = useConfirm();
  const {
    workspaces,
    loadingWorkspaces,
    submitting,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
  } = useDashboard();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<WorkspaceModal>(null);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(
    null,
  );

  const filteredWorkspaces = useMemo(
    () =>
      workspaces.filter((workspace) =>
        workspace.name
          .toLocaleLowerCase("vi")
          .includes(search.toLocaleLowerCase("vi").trim()),
      ),
    [search, workspaces],
  );
  const totalPages = Math.max(1, Math.ceil(filteredWorkspaces.length / 5));
  const currentPage = Math.min(page, totalPages);
  const paginatedWorkspaces = filteredWorkspaces.slice(
    (currentPage - 1) * 5,
    currentPage * 5,
  );

  function openModal(name: WorkspaceModal, workspace?: Workspace) {
    setSelectedWorkspace(workspace ?? null);
    setModal(name);
  }

  async function submitWorkspace(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = String(
      new FormData(event.currentTarget).get("name") ?? "",
    ).trim();
    if (!name) return;
    const description = String(
      new FormData(event.currentTarget).get("description") ?? "",
    ).trim();
    const success =
      modal === "edit" && selectedWorkspace
        ? await updateWorkspace(selectedWorkspace.id, name)
        : await createWorkspace(name, description);
    if (success) setModal(null);
  }

  async function confirmDelete(workspace: Workspace) {
    const accepted = await confirm({
      variant: "delete",
      title: "Xóa workspace?",
      message: `Toàn bộ task và thành viên trong “${workspace.name}” cũng sẽ bị xóa.`,
      confirmText: "Xóa workspace",
    });
    if (accepted) await deleteWorkspace(workspace.id);
  }

  return (
    <section className={styles.page}>
      <div className={styles.pageHead}>
        <div>
          <span className={styles.eyebrow}>Tổng quan</span>
          <h1>Workspace của tôi</h1>
          <p>Quản lý toàn bộ workspace mà bạn đang tham gia.</p>
        </div>
        <button
          className={`${styles.button} ${styles.primaryButton}`}
          onClick={() => openModal("add")}
        >
          <Icon name="plus" size={18} /> Thêm dự án
        </button>
      </div>
      <div className={styles.toolbar}>
        <label className={styles.searchWrap}>
          <Icon name="search" size={18} />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Tìm kiếm tên workspace..."
          />
          <span className={styles.srOnly}>Tìm workspace</span>
        </label>
        <span className={styles.resultCount}>
          {filteredWorkspaces.length} workspace
        </span>
      </div>
      <div className={`${styles.card} ${styles.tableWrap}`}>
        <table>
          <thead>
            <tr>
              <th>Tên workspace</th>
              <th>Thành viên</th>
              <th>Vai trò của bạn</th>
              <th>Task</th>
              <th>Cập nhật gần nhất</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paginatedWorkspaces.map((workspace) => (
              <tr key={workspace.id}>
                <td>
                  <Link
                    className={styles.workspaceName}
                    href={`/workspace/${workspace.id}`}
                  >
                    {workspace.name}
                  </Link>
                </td>
                <td>
                  <AvatarStack
                    members={workspace.members}
                    total={workspace.memberCount}
                    limit={8}
                  />
                </td>
                <td>
                  <span
                    className={`${styles.badge} ${styles[`badge${workspace.role}`]}`}
                  >
                    {workspace.role}
                  </span>
                </td>
                <td>
                  <strong className={styles.tableNumber}>
                    {workspace.taskCount}
                  </strong>
                </td>
                <td>{workspace.updatedAt}</td>
                <td>
                  {workspace.role === "Owner" ? (
                    <div className={styles.iconActions}>
                      <button
                        className={styles.iconButton}
                        title="Sửa workspace"
                        onClick={() => openModal("edit", workspace)}
                      >
                        <Icon name="edit" size={17} />
                      </button>
                      <button
                        className={`${styles.iconButton} ${styles.dangerIcon}`}
                        title="Xóa workspace"
                        onClick={() => void confirmDelete(workspace)}
                      >
                        <Icon name="trash" size={17} />
                      </button>
                    </div>
                  ) : (
                    <span className={styles.mutedDash}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loadingWorkspaces && !filteredWorkspaces.length && (
          <EmptyState message="Thử thay đổi từ khóa hoặc tạo workspace mới." />
        )}
      </div>
      {loadingWorkspaces && <p>Đang tải workspace...</p>}
      {filteredWorkspaces.length > 5 && (
        <nav className={styles.pagination} aria-label="Phân trang workspace">
          <button
            className={`${styles.button} ${styles.cancelButton}`}
            disabled={currentPage === 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Trang trước
          </button>
          <span>
            Trang {currentPage}/{totalPages}
          </span>
          <button
            className={`${styles.button} ${styles.cancelButton}`}
            disabled={currentPage === totalPages}
            onClick={() =>
              setPage((current) => Math.min(totalPages, current + 1))
            }
          >
            Trang sau
          </button>
        </nav>
      )}

      {modal === "add" && (
        <Modal
          title="Tạo workspace mới"
          subtitle="Bắt đầu một không gian làm việc cho đội nhóm của bạn."
          onClose={() => setModal(null)}
        >
          <form className={styles.modalForm} onSubmit={submitWorkspace}>
            <label>
              Tên workspace
              <input
                name="name"
                placeholder="Ví dụ: Marketing Website"
                autoFocus
                required
              />
            </label>
            <label>
              Mô tả
              <textarea
                name="description"
                placeholder="Mô tả ngắn về dự án..."
                rows={3}
              />
            </label>
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
                <Icon name="plus" size={17} /> Tạo workspace
              </button>
            </div>
          </form>
        </Modal>
      )}
      {modal === "edit" && selectedWorkspace && (
        <Modal
          title="Chỉnh sửa workspace"
          subtitle="Cập nhật thông tin hiển thị của workspace."
          onClose={() => setModal(null)}
        >
          <form className={styles.modalForm} onSubmit={submitWorkspace}>
            <label>
              Tên workspace
              <input
                name="name"
                defaultValue={selectedWorkspace.name}
                autoFocus
                required
              />
            </label>
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
                Lưu thay đổi
              </button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}
