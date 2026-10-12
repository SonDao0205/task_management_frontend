import { makeAutoObservable, runInAction } from "mobx";
import { mapWorkspace } from "../features/dashboard/mappers";
import type {
  ApiRole,
  Workspace,
  WorkspaceDto,
} from "../features/dashboard/types";
import { ErrorHandler } from "../utils/errorHandler";
import {
  workspaceService,
  type WorkspaceService,
} from "../services/workspace.service";

export class WorkspaceStore {
  workspaces: Workspace[] = [];
  workspace: Workspace | null = null;
  loadingWorkspaces = true;
  loadingWorkspace = false;
  submitting = false;

  constructor(private service: WorkspaceService = workspaceService) {
    makeAutoObservable<this, "service">(
      this,
      { service: false },
      { autoBind: true },
    );
  }

  private handleError(error: unknown) {
    ErrorHandler.errorHandler(ErrorHandler.getErrorMessage(error));
  }

  private setWorkspaceListItem(dto: WorkspaceDto) {
    const item = mapWorkspace(dto);
    const exists = this.workspaces.some(({ id }) => id === item.id);
    this.workspaces = exists
      ? this.workspaces.map((workspace) =>
          workspace.id === item.id ? item : workspace,
        )
      : [item, ...this.workspaces];
    if (this.workspace?.id === item.id) this.workspace = item;
  }

  loadWorkspaces = async () => {
    this.loadingWorkspaces = true;
    try {
      const workspaces = (await this.service.list()).map(mapWorkspace);
      runInAction(() => {
        this.workspaces = workspaces;
      });
    } catch (error) {
      this.handleError(error);
    } finally {
      runInAction(() => {
        this.loadingWorkspaces = false;
      });
    }
  };

  loadWorkspace = async (id: string) => {
    this.loadingWorkspace = true;
    try {
      const dto = await this.service.detail(id);
      runInAction(() => {
        this.workspace = mapWorkspace(dto);
        this.setWorkspaceListItem(dto);
      });
      return true;
    } catch (error) {
      runInAction(() => {
        this.workspace = null;
      });
      this.handleError(error);
      return false;
    } finally {
      runInAction(() => {
        this.loadingWorkspace = false;
      });
    }
  };

  createWorkspace = async (name: string, description: string) =>
    this.submit(async () => {
      const workspace = await this.service.create(name, description);
      runInAction(() => this.setWorkspaceListItem(workspace));
      return "Đã tạo workspace mới";
    });

  updateWorkspace = async (id: string, name: string) =>
    this.submit(async () => {
      const workspace = await this.service.update(id, name);
      runInAction(() => this.setWorkspaceListItem(workspace));
      return "Đã cập nhật workspace";
    });

  deleteWorkspace = async (id: string) =>
    this.submit(async () => {
      await this.service.delete(id);
      runInAction(() => {
        this.workspaces = this.workspaces.filter((item) => item.id !== id);
        if (this.workspace?.id === id) this.workspace = null;
      });
      return "Đã xóa workspace";
    });

  addMember = async (id: string, email: string, role: ApiRole) =>
    this.submit(async () => {
      await this.service.addMember(id, email, role);
      await this.loadWorkspace(id);
      return `Đã thêm ${email} vào workspace`;
    });

  updateMember = async (
    id: string,
    memberId: string,
    role: ApiRole,
    status: "active" | "inactive" | "banned",
  ) =>
    this.submit(async () => {
      await this.service.updateMember(id, memberId, role, status);
      await Promise.all([this.loadWorkspace(id), this.loadWorkspaces()]);
      return "Đã cập nhật vai trò thành viên";
    });

  deleteMember = async (id: string, memberId: string) =>
    this.submit(async () => {
      await this.service.deleteMember(id, memberId);
      await Promise.all([this.loadWorkspace(id), this.loadWorkspaces()]);
      return "Đã xóa thành viên khỏi workspace";
    });

  private submit = async (operation: () => Promise<string>) => {
    this.submitting = true;
    try {
      const message = await operation();
      return { success: true, message };
    } catch (error) {
      this.handleError(error);
      return { success: false, message: "" };
    } finally {
      runInAction(() => {
        this.submitting = false;
      });
    }
  };
}
