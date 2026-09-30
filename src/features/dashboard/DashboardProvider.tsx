"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import {
  currentUser,
  initialWorkspaceTasks,
  initialWorkspaces,
} from "./mock-data";
import type { Task, TaskDraft, Workspace } from "./types";

type DashboardContextValue = {
  workspaces: Workspace[];
  tasks: Task[];
  toast: string;
  createWorkspace: (name: string) => void;
  updateWorkspace: (id: number, name: string) => void;
  deleteWorkspace: (id: number) => void;
  addTask: (workspaceId: number, draft: TaskDraft) => void;
  addMember: (workspaceId: number, email: string) => void;
  notify: (message: string) => void;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [workspaces, setWorkspaces] = useState(initialWorkspaces);
  const [tasks, setTasks] = useState(initialWorkspaceTasks);
  const [toast, setToast] = useState("");

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }

  function createWorkspace(name: string) {
    setWorkspaces((current) => [
      {
        id: Date.now(),
        name,
        role: "Owner",
        taskCount: 0,
        updatedAt: "Vừa xong",
        memberCount: 1,
        members: [currentUser],
      },
      ...current,
    ]);
    notify(`Đã tạo workspace “${name}”`);
  }

  function updateWorkspace(id: number, name: string) {
    setWorkspaces((current) =>
      current.map((workspace) =>
        workspace.id === id
          ? { ...workspace, name, updatedAt: "Vừa xong" }
          : workspace,
      ),
    );
    notify("Đã cập nhật tên workspace");
  }

  function deleteWorkspace(id: number) {
    const target = workspaces.find((workspace) => workspace.id === id);
    setWorkspaces((current) =>
      current.filter((workspace) => workspace.id !== id),
    );
    notify(`Đã xóa workspace “${target?.name ?? ""}”`);
  }

  function addTask(workspaceId: number, draft: TaskDraft) {
    const nextNumber = 120 + tasks.length;
    setTasks((current) => [
      {
        id: `TM-${nextNumber}`,
        ...draft,
        description: draft.description || "Chưa có mô tả.",
        days: 7,
        assignee: currentUser,
      },
      ...current,
    ]);
    setWorkspaces((current) =>
      current.map((workspace) =>
        workspace.id === workspaceId
          ? {
              ...workspace,
              taskCount: workspace.taskCount + 1,
              updatedAt: "Vừa xong",
            }
          : workspace,
      ),
    );
    notify("Đã thêm nhiệm vụ mới");
  }

  function addMember(workspaceId: number, email: string) {
    setWorkspaces((current) =>
      current.map((workspace) =>
        workspace.id === workspaceId
          ? { ...workspace, memberCount: workspace.memberCount + 1 }
          : workspace,
      ),
    );
    notify(`Đã gửi lời mời tới ${email}`);
  }

  return (
    <DashboardContext.Provider
      value={{
        workspaces,
        tasks,
        toast,
        createWorkspace,
        updateWorkspace,
        deleteWorkspace,
        addTask,
        addMember,
        notify,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context)
    throw new Error("useDashboard must be used inside DashboardProvider");
  return context;
}
