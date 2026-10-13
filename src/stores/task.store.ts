import { makeAutoObservable, runInAction } from "mobx";
import { mapTask } from "../features/dashboard/mappers";
import type {
  MyTaskWorkspace,
  StatusKey,
  Task,
  TaskDraft,
} from "../features/dashboard/types";
import { ErrorHandler } from "../utils/errorHandler";
import { taskService, type TaskService } from "../services/task.service";
import type { WorkspaceStore } from "./workspace.store";

export class TaskStore {
  tasks: Task[] = [];
  myTaskWorkspaces: MyTaskWorkspace[] = [];
  loadingMyTasks = false;
  submitting = false;

  constructor(
    private workspaceStore: WorkspaceStore,
    private service: TaskService = taskService,
  ) {
    makeAutoObservable<this, "workspaceStore" | "service">(
      this,
      { workspaceStore: false, service: false },
      { autoBind: true },
    );
  }

  private handleError(error: unknown) {
    ErrorHandler.errorHandler(ErrorHandler.getErrorMessage(error));
  }

  loadWorkspaceTasks = async (workspaceId: string) => {
    this.tasks = [];
    try {
      const tasks = (await this.service.listByWorkspace(workspaceId)).map(
        mapTask,
      );
      runInAction(() => {
        this.tasks = tasks;
      });
    } catch (error) {
      this.handleError(error);
    }
  };

  loadMyTasks = async () => {
    this.loadingMyTasks = true;
    try {
      const tasks = (await this.service.myTasks()).map(mapTask);
      const grouped = new Map<string, MyTaskWorkspace>();
      for (const task of tasks) {
        const group = grouped.get(task.workspaceId) ?? {
          id: task.workspaceId,
          name: task.workspaceName ?? "Workspace",
          tasks: [],
        };
        group.tasks.push(task);
        grouped.set(task.workspaceId, group);
      }
      runInAction(() => {
        this.myTaskWorkspaces = [...grouped.values()];
      });
    } catch (error) {
      this.handleError(error);
    } finally {
      runInAction(() => {
        this.loadingMyTasks = false;
      });
    }
  };

  addTask = async (workspaceId: string, draft: TaskDraft) =>
    this.submit(async () => {
      await this.service.create(workspaceId, draft);
      await Promise.all([
        this.workspaceStore.loadWorkspace(workspaceId),
        this.workspaceStore.loadWorkspaces(),
        this.loadWorkspaceTasks(workspaceId),
      ]);
      return "Đã thêm nhiệm vụ mới";
    });

  updateTask = async (task: Task, status: StatusKey, memberIds?: string[]) =>
    this.submit(
      async () => {
        await this.service.update(task, status, memberIds);
        const refreshes = [this.loadMyTasks()];
        if (this.workspaceStore.workspace?.id === task.workspaceId) {
          refreshes.push(this.loadWorkspaceTasks(task.workspaceId));
        }
        await Promise.all(refreshes);
        return "Đã cập nhật task";
      },
      async () => {
        if (this.workspaceStore.workspace?.id === task.workspaceId) {
          await this.workspaceStore.loadWorkspace(task.workspaceId);
          await this.loadWorkspaceTasks(task.workspaceId);
        }
      },
    );

  deleteTask = async (task: Task) =>
    this.submit(
      async () => {
        await this.service.delete(task.id);
        const refreshes = [this.loadMyTasks()];
        if (this.workspaceStore.workspace?.id === task.workspaceId) {
          refreshes.push(this.loadWorkspaceTasks(task.workspaceId));
        }
        await Promise.all(refreshes);
        return "Đã xoá task";
      },
      async () => {
        if (this.workspaceStore.workspace?.id === task.workspaceId) {
          await this.workspaceStore.loadWorkspace(task.workspaceId);
          await this.loadWorkspaceTasks(task.workspaceId);
        }
      },
    );

  private submit = async (
    operation: () => Promise<string>,
    recover?: () => Promise<void>,
  ) => {
    this.submitting = true;
    try {
      const message = await operation();
      return { success: true, message };
    } catch (error) {
      await recover?.();
      this.handleError(error);
      return { success: false, message: "" };
    } finally {
      runInAction(() => {
        this.submitting = false;
      });
    }
  };
}
