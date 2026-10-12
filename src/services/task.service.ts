import { API } from "../common/api";
import { request } from "../common/request";
import { apiStatus, priorityValue } from "../features/dashboard/mappers";
import type { StatusKey, Task, TaskDraft, TaskDto } from "../features/dashboard/types";

export class TaskService {
  listByWorkspace = async (workspaceId: string) =>
    (await request.get<TaskDto[]>(API.WORKSPACES.TASKS(workspaceId))).data;

  myTasks = async () => (await request.get<TaskDto[]>(API.TASKS.MY_TASKS)).data;

  create = (workspaceId: string, draft: TaskDraft) =>
    request.post<unknown, {
      title: string;
      description: string;
      priority: number;
      start_at: string;
      end_at: string;
      status: string;
      workspace_id: string;
      member_ids: string[];
    }>(API.TASKS.CREATE, {
      title: draft.title,
      description: draft.description,
      priority: priorityValue(draft.priority),
      start_at: new Date(draft.startAt).toISOString(),
      end_at: new Date(draft.endAt).toISOString(),
      status: apiStatus(draft.status),
      workspace_id: workspaceId,
      member_ids: draft.memberIds,
    });

  update = async (task: Task, status: StatusKey, memberIds?: string[]) => {
    const toAssign = memberIds?.filter((id) => !task.memberIds.includes(id));
    const toUnassign = memberIds
      ? task.memberIds.filter((id) => !memberIds.includes(id))
      : [];

    if (toAssign?.length) {
      await request.post<unknown, { member_ids: string[] }>(
        API.TASKS.ASSIGNEES(task.id), { member_ids: toAssign },
      );
    }
    if (toUnassign.length) {
      await request.delete<unknown, { member_ids: string[] }>(
        API.TASKS.ASSIGNEES(task.id), { member_ids: toUnassign },
      );
    }
    if (status !== task.status) {
      await request.patch<unknown, { status: string }>(
        API.TASKS.DETAIL(task.id), { status: apiStatus(status) },
      );
    }
  };
}

export const taskService = new TaskService();
