"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { API } from "@/src/common/api";
import { request } from "@/src/common/request";
import { ErrorHandler } from "@/src/utils/errorHandler";
import { apiStatus, mapTask, mapWorkspace, priorityValue } from "./mappers";
import type {
  ApiRole,
  MyTaskWorkspace,
  Task,
  TaskDraft,
  TaskDto,
  StatusKey,
  Workspace,
  WorkspaceDto,
} from "./types";

type DashboardContextValue = {
  workspaces: Workspace[];
  workspace: Workspace | null;
  tasks: Task[];
  myTaskWorkspaces: MyTaskWorkspace[];
  loadingWorkspaces: boolean;
  loadingWorkspace: boolean;
  loadingMyTasks: boolean;
  submitting: boolean;
  toast: string;
  loadWorkspaces: () => Promise<void>;
  loadWorkspace: (workspaceId: string) => Promise<void>;
  loadMyTasks: () => Promise<void>;
  createWorkspace: (name: string, description: string) => Promise<boolean>;
  updateWorkspace: (id: string, name: string) => Promise<boolean>;
  deleteWorkspace: (id: string) => Promise<boolean>;
  addMember: (
    workspaceId: string,
    email: string,
    role: ApiRole,
  ) => Promise<boolean>;
  updateMember: (
    workspaceId: string,
    memberId: string,
    role: ApiRole,
    status: "active" | "inactive" | "banned",
  ) => Promise<boolean>;
  deleteMember: (workspaceId: string, memberId: string) => Promise<boolean>;
  addTask: (workspaceId: string, draft: TaskDraft) => Promise<boolean>;
  updateTask: (
    task: Task,
    status: StatusKey,
    memberIds?: string[],
  ) => Promise<boolean>;
  notify: (message: string) => void;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

function showError(error: unknown) {
  ErrorHandler.errorHandler(ErrorHandler.getErrorMessage(error));
}

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [myTaskWorkspaces, setMyTaskWorkspaces] = useState<MyTaskWorkspace[]>(
    [],
  );
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(true);
  const [loadingWorkspace, setLoadingWorkspace] = useState(false);
  const [loadingMyTasks, setLoadingMyTasks] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState("");

  const notify = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }, []);

  const loadWorkspaces = useCallback(async () => {
    setLoadingWorkspaces(true);
    try {
      const response = await request.get<WorkspaceDto[]>(API.WORKSPACES.LIST);
      setWorkspaces(response.data.map(mapWorkspace));
    } catch (error) {
      showError(error);
    } finally {
      setLoadingWorkspaces(false);
    }
  }, []);

  const loadWorkspace = useCallback(async (workspaceId: string) => {
    setLoadingWorkspace(true);
    try {
      const [workspaceResponse, taskResponse] = await Promise.all([
        request.get<WorkspaceDto>(API.WORKSPACES.DETAIL(workspaceId)),
        request.get<TaskDto[]>(API.WORKSPACES.TASKS(workspaceId)),
      ]);
      const mappedWorkspace = mapWorkspace(workspaceResponse.data);
      setWorkspace(mappedWorkspace);
      setTasks(taskResponse.data.map(mapTask));
      setWorkspaces((current) => {
        const exists = current.some((item) => item.id === mappedWorkspace.id);
        return exists
          ? current.map((item) =>
              item.id === mappedWorkspace.id ? mappedWorkspace : item,
            )
          : [mappedWorkspace, ...current];
      });
    } catch (error) {
      setWorkspace(null);
      setTasks([]);
      showError(error);
    } finally {
      setLoadingWorkspace(false);
    }
  }, []);

  const loadMyTasks = useCallback(async () => {
    setLoadingMyTasks(true);
    try {
      const response = await request.get<TaskDto[]>(API.TASKS.MY_TASKS);
      const grouped = new Map<string, MyTaskWorkspace>();
      for (const taskDto of response.data) {
        const task = mapTask(taskDto);
        const group = grouped.get(task.workspaceId) ?? {
          id: task.workspaceId,
          name: task.workspaceName ?? "Workspace",
          tasks: [],
        };
        group.tasks.push(task);
        grouped.set(task.workspaceId, group);
      }
      setMyTaskWorkspaces([...grouped.values()]);
    } catch (error) {
      showError(error);
    } finally {
      setLoadingMyTasks(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => void loadWorkspaces(), 0);
    return () => window.clearTimeout(timeout);
  }, [loadWorkspaces]);

  const createWorkspace = useCallback(
    async (name: string, description: string) => {
      setSubmitting(true);
      try {
        const response = await request.post<
          WorkspaceDto,
          { name: string; description: string }
        >(API.WORKSPACES.LIST, { name, description });
        setWorkspaces((current) => [mapWorkspace(response.data), ...current]);
        notify("Đã tạo workspace mới");
        return true;
      } catch (error) {
        showError(error);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [notify],
  );

  const updateWorkspace = useCallback(
    async (id: string, name: string) => {
      setSubmitting(true);
      try {
        const response = await request.patch<WorkspaceDto, { name: string }>(
          API.WORKSPACES.DETAIL(id),
          { name },
        );
        const mapped = mapWorkspace(response.data);
        setWorkspaces((current) =>
          current.map((item) => (item.id === id ? mapped : item)),
        );
        if (workspace?.id === id) setWorkspace(mapped);
        notify("Đã cập nhật workspace");
        return true;
      } catch (error) {
        showError(error);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [notify, workspace],
  );

  const deleteWorkspace = useCallback(
    async (id: string) => {
      setSubmitting(true);
      try {
        await request.delete<null>(API.WORKSPACES.DETAIL(id));
        setWorkspaces((current) => current.filter((item) => item.id !== id));
        notify("Đã xóa workspace");
        return true;
      } catch (error) {
        showError(error);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [notify],
  );

  const addMember = useCallback(
    async (workspaceId: string, email: string, role: ApiRole) => {
      setSubmitting(true);
      try {
        await request.post<
          unknown,
          { email: string; role: ApiRole; status: "active" }
        >(API.WORKSPACES.MEMBERS(workspaceId), {
          email,
          role,
          status: "active",
        });
        await loadWorkspace(workspaceId);
        notify(`Đã thêm ${email} vào workspace`);
        return true;
      } catch (error) {
        showError(error);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [loadWorkspace, notify],
  );

  const updateMember = useCallback(
    async (
      workspaceId: string,
      memberId: string,
      role: ApiRole,
      status: "active" | "inactive" | "banned",
    ) => {
      setSubmitting(true);
      try {
        await request.patch<unknown, { role: ApiRole; status: typeof status }>(
          API.WORKSPACES.MEMBER(workspaceId, memberId),
          { role, status },
        );
        await Promise.all([loadWorkspace(workspaceId), loadWorkspaces()]);
        notify("Đã cập nhật vai trò thành viên");
        return true;
      } catch (error) {
        showError(error);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [loadWorkspace, loadWorkspaces, notify],
  );

  const deleteMember = useCallback(
    async (workspaceId: string, memberId: string) => {
      setSubmitting(true);
      try {
        await request.delete<null>(
          API.WORKSPACES.MEMBER(workspaceId, memberId),
        );
        await Promise.all([loadWorkspace(workspaceId), loadWorkspaces()]);
        notify("Đã xóa thành viên khỏi workspace");
        return true;
      } catch (error) {
        showError(error);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [loadWorkspace, loadWorkspaces, notify],
  );

  const addTask = useCallback(
    async (workspaceId: string, draft: TaskDraft) => {
      setSubmitting(true);
      try {
        await request.post<
          unknown,
          {
            title: string;
            description: string;
            priority: number;
            start_at: string;
            end_at: string;
            status: string;
            workspace_id: string;
            member_ids: string[];
          }
        >(API.TASKS.CREATE, {
          title: draft.title,
          description: draft.description,
          priority: priorityValue(draft.priority),
          start_at: new Date(draft.startAt).toISOString(),
          end_at: new Date(draft.endAt).toISOString(),
          status: apiStatus(draft.status),
          workspace_id: workspaceId,
          member_ids: draft.memberIds,
        });
        await Promise.all([loadWorkspace(workspaceId), loadWorkspaces()]);
        notify("Đã thêm nhiệm vụ mới");
        return true;
      } catch (error) {
        showError(error);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [loadWorkspace, loadWorkspaces, notify],
  );

  const updateTask = useCallback(
    async (task: Task, status: StatusKey, memberIds?: string[]) => {
      setSubmitting(true);
      try {
        const memberIdsToAssign = memberIds?.filter(
          (memberId) => !task.memberIds.includes(memberId),
        );
        const memberIdsToUnassign = memberIds
          ? task.memberIds.filter((memberId) => !memberIds.includes(memberId))
          : [];

        if (memberIdsToAssign?.length) {
          await request.post<unknown, { member_ids: string[] }>(
            API.TASKS.ASSIGNEES(task.id),
            { member_ids: memberIdsToAssign },
          );
        }
        if (memberIdsToUnassign.length) {
          await request.delete<unknown, { member_ids: string[] }>(
            API.TASKS.ASSIGNEES(task.id),
            { member_ids: memberIdsToUnassign },
          );
        }
        if (status !== task.status) {
          await request.patch<unknown, { status: string }>(
            API.TASKS.DETAIL(task.id),
            { status: apiStatus(status) },
          );
        }

        const refreshes: Promise<void>[] = [loadMyTasks()];
        if (workspace?.id === task.workspaceId) {
          refreshes.push(loadWorkspace(task.workspaceId));
        }
        await Promise.all(refreshes);
        notify("Đã cập nhật task");
        return true;
      } catch (error) {
        if (workspace?.id === task.workspaceId) {
          await loadWorkspace(task.workspaceId);
        }
        showError(error);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [loadMyTasks, loadWorkspace, notify, workspace],
  );

  const value = useMemo(
    () => ({
      workspaces,
      workspace,
      tasks,
      myTaskWorkspaces,
      loadingWorkspaces,
      loadingWorkspace,
      loadingMyTasks,
      submitting,
      toast,
      loadWorkspaces,
      loadWorkspace,
      loadMyTasks,
      createWorkspace,
      updateWorkspace,
      deleteWorkspace,
      addMember,
      updateMember,
      deleteMember,
      addTask,
      updateTask,
      notify,
    }),
    [
      workspaces,
      workspace,
      tasks,
      myTaskWorkspaces,
      loadingWorkspaces,
      loadingWorkspace,
      loadingMyTasks,
      submitting,
      toast,
      loadWorkspaces,
      loadWorkspace,
      loadMyTasks,
      createWorkspace,
      updateWorkspace,
      deleteWorkspace,
      addMember,
      updateMember,
      deleteMember,
      addTask,
      updateTask,
      notify,
    ],
  );

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used inside DashboardProvider");
  }
  return context;
}
