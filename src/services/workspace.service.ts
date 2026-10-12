import { API } from "../common/api";
import { request } from "../common/request";
import type { ApiRole, WorkspaceDto } from "../features/dashboard/types";

export class WorkspaceService {
  list = async () => (await request.get<WorkspaceDto[]>(API.WORKSPACES.LIST)).data;

  detail = async (workspaceId: string) =>
    (await request.get<WorkspaceDto>(API.WORKSPACES.DETAIL(workspaceId))).data;

  create = async (name: string, description: string) =>
    (await request.post<WorkspaceDto, { name: string; description: string }>(
      API.WORKSPACES.LIST,
      { name, description },
    )).data;

  update = async (id: string, name: string) =>
    (await request.patch<WorkspaceDto, { name: string }>(
      API.WORKSPACES.DETAIL(id),
      { name },
    )).data;

  delete = (id: string) => request.delete<null>(API.WORKSPACES.DETAIL(id));

  addMember = (workspaceId: string, email: string, role: ApiRole) =>
    request.post<unknown, { email: string; role: ApiRole; status: "active" }>(
      API.WORKSPACES.MEMBERS(workspaceId),
      { email, role, status: "active" },
    );

  updateMember = (
    workspaceId: string,
    memberId: string,
    role: ApiRole,
    status: "active" | "inactive" | "banned",
  ) =>
    request.patch<unknown, { role: ApiRole; status: typeof status }>(
      API.WORKSPACES.MEMBER(workspaceId, memberId),
      { role, status },
    );

  deleteMember = (workspaceId: string, memberId: string) =>
    request.delete<null>(API.WORKSPACES.MEMBER(workspaceId, memberId));
}

export const workspaceService = new WorkspaceService();
