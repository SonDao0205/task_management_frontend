"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "@/app/page.module.css";
import { useDashboard } from "../DashboardProvider";
import { statusKeys, type StatusKey, type Task } from "../types";
import { StatusSection, TaskDetailModal } from "../components/task";
import { EmptyState, Icon } from "../components/ui";

export default function MyTasksPage() {
  const {
    workspace: taskWorkspace,
    myTaskWorkspaces,
    loadingMyTasks,
    submitting,
    loadWorkspace,
    loadMyTasks,
    updateTask,
  } = useDashboard();
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState("default");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [openWorkspaces, setOpenWorkspaces] = useState<Record<string, boolean>>(
    {},
  );
  const [openStatuses, setOpenStatuses] = useState<Record<string, boolean>>({
  });

  useEffect(() => {
    void loadMyTasks();
  }, [loadMyTasks]);

  const filteredWorkspaces = useMemo(
    () =>
      myTaskWorkspaces.map((workspace) => {
        const filtered = workspace.tasks.filter((task) =>
          task.title
            .toLocaleLowerCase("vi")
            .includes(search.toLocaleLowerCase("vi").trim()),
        );
        const tasks =
          sortMode === "default"
            ? filtered
            : [...filtered].sort((a, b) =>
                sortMode === "asc" ? a.days - b.days : b.days - a.days,
              );
        return { ...workspace, tasks };
      }),
    [myTaskWorkspaces, search, sortMode],
  );

  function toggleStatus(workspaceId: string, status: StatusKey) {
    const key = `${workspaceId}-${status}`;
    setOpenStatuses((current) => ({ ...current, [key]: !current[key] }));
  }

  function openTask(task: Task) {
    setSelectedTask(task);
    void loadWorkspace(task.workspaceId);
  }

  return (
    <section className={styles.page}>
      <div className={styles.pageHead}>
        <div>
          <span className={styles.eyebrow}>Công việc</span>
          <h1>Nhiệm vụ của tôi</h1>
          <p>
            Các task đang được giao cho bạn, được gom theo workspace và trạng
            thái.
          </p>
        </div>
        <div className={styles.summaryPill}>
          <span>
            {myTaskWorkspaces.reduce(
              (total, workspace) => total + workspace.tasks.length,
              0,
            )}
          </span>
          <small>Tổng nhiệm vụ</small>
        </div>
      </div>
      <div className={styles.toolbar}>
        <label className={styles.searchWrap}>
          <Icon name="search" size={18} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm kiếm nhiệm vụ..."
          />
          <span className={styles.srOnly}>Tìm nhiệm vụ của tôi</span>
        </label>
        <label className={styles.selectWrap}>
          <Icon name="calendar" size={17} />
          <select
            value={sortMode}
            onChange={(event) => setSortMode(event.target.value)}
          >
            <option value="default">Sắp xếp theo thời gian</option>
            <option value="desc">Thời gian còn lại: nhiều → ít</option>
            <option value="asc">Thời gian còn lại: ít → nhiều</option>
          </select>
        </label>
      </div>
      {loadingMyTasks && <p>Đang tải nhiệm vụ...</p>}
      {filteredWorkspaces.map((workspace, workspaceIndex) => (
        <section
          key={workspace.id}
          className={`${styles.card} ${styles.workspaceAccordion} ${
            (openWorkspaces[workspace.id] ?? workspaceIndex === 0)
              ? styles.sectionOpen
              : ""
          }`}
        >
          <button
            className={styles.accordionHead}
            onClick={() =>
              setOpenWorkspaces((current) => ({
                ...current,
                [workspace.id]: !(current[workspace.id] ?? workspaceIndex === 0),
              }))
            }
          >
            <span className={styles.accordionTitle}>
              <span className={styles.workspaceIcon}>
                <Icon name="folder" size={18} />
              </span>
              <span>
                {workspace.name}
                <small>{workspace.tasks.length} task</small>
              </span>
            </span>
            <span className={styles.rotateIcon}>
              <Icon name="chevron" size={17} />
            </span>
          </button>
          {(openWorkspaces[workspace.id] ?? workspaceIndex === 0) && (
            <div className={styles.workspaceAccordionBody}>
              {statusKeys.map((status) => {
                const tasks = workspace.tasks.filter(
                  (task) => task.status === status,
                );
                return tasks.length ? (
                  <StatusSection
                    key={status}
                    status={status}
                    tasks={tasks}
                    open={Boolean(openStatuses[`${workspace.id}-${status}`])}
                    onToggle={() => toggleStatus(workspace.id, status)}
                    onOpenTask={openTask}
                  />
                ) : null;
              })}
              {!workspace.tasks.length && (
                <EmptyState message="Không có task nào khớp với từ khóa của bạn." />
              )}
            </div>
          )}
        </section>
      ))}
      {!loadingMyTasks && !filteredWorkspaces.length && (
        <div className={`${styles.card} ${styles.standaloneEmpty}`}>
          <EmptyState message="Bạn chưa được giao nhiệm vụ nào." />
        </div>
      )}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          members={
            taskWorkspace?.id === selectedTask.workspaceId
              ? taskWorkspace.members
              : []
          }
          canManageAssignees={
            taskWorkspace?.id === selectedTask.workspaceId &&
            (taskWorkspace.role === "Owner" || taskWorkspace.role === "Master")
          }
          canUpdateStatus
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
