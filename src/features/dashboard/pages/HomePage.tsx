"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import styles from "@/app/page.module.css";
import { useDashboard } from "../DashboardProvider";
import type { Workspace } from "../types";
import {
  AvatarStack,
  EmptyState,
  Icon,
  Modal,
} from "../components/DashboardUi";

type WorkspaceModal = "add" | "edit" | "delete" | null;

export default function HomePage() {
  const { workspaces, createWorkspace, updateWorkspace, deleteWorkspace } =
    useDashboard();
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<WorkspaceModal>(null);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(
    null,
  );

  const filteredWorkspaces = workspaces.filter((workspace) =>
    workspace.name
      .toLocaleLowerCase("vi")
      .includes(search.toLocaleLowerCase("vi").trim()),
  );

  function openModal(name: WorkspaceModal, workspace?: Workspace) {
    setSelectedWorkspace(workspace ?? null);
    setModal(name);
  }

  function submitWorkspace(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = String(
      new FormData(event.currentTarget).get("name") ?? "",
    ).trim();
    if (!name) return;
    if (modal === "edit" && selectedWorkspace)
      updateWorkspace(selectedWorkspace.id, name);
    else createWorkspace(name);
    setModal(null);
  }

  function confirmDelete() {
    if (selectedWorkspace) deleteWorkspace(selectedWorkspace.id);
    setModal(null);
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
            onChange={(event) => setSearch(event.target.value)}
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
            {filteredWorkspaces.map((workspace) => (
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
                        onClick={() => openModal("delete", workspace)}
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
        {!filteredWorkspaces.length && (
          <EmptyState message="Thử thay đổi từ khóa hoặc tạo workspace mới." />
        )}
      </div>

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
              <button className={`${styles.button} ${styles.primaryButton}`}>
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
              <button className={`${styles.button} ${styles.primaryButton}`}>
                Lưu thay đổi
              </button>
            </div>
          </form>
        </Modal>
      )}
      {modal === "delete" && selectedWorkspace && (
        <Modal
          title="Xóa workspace?"
          subtitle="Hành động này chỉ mô phỏng trên dữ liệu giao diện hiện tại."
          danger
          onClose={() => setModal(null)}
        >
          <div className={styles.confirmContent}>
            Bạn có chắc muốn xóa <strong>{selectedWorkspace.name}</strong>?
            Workspace sẽ biến mất khỏi danh sách cho đến khi tải lại trang.
          </div>
          <div className={styles.modalActions}>
            <button
              className={`${styles.button} ${styles.cancelButton}`}
              onClick={() => setModal(null)}
            >
              Giữ lại
            </button>
            <button
              className={`${styles.button} ${styles.dangerButton}`}
              onClick={confirmDelete}
            >
              <Icon name="trash" size={17} /> Xóa workspace
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}
