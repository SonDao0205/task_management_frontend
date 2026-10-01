import type {
  ApiRole,
  ApiTaskStatus,
  Priority,
  Role,
  StatusKey,
  Task,
  TaskDto,
  Workspace,
  WorkspaceDto,
  WorkspaceMember,
  WorkspaceMemberDto,
} from "./types";

const avatarColors = ["blue", "purple", "orange", "green", "pink"];

function initials(name: string): string {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(-2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U"
  );
}

function colorFor(value: string): string {
  const hash = [...value].reduce((total, char) => total + char.charCodeAt(0), 0);
  return avatarColors[hash % avatarColors.length] ?? "blue";
}

export function mapRole(role: ApiRole): Role {
  return role === "owner" ? "Owner" : role === "master" ? "Master" : "Member";
}

export function mapMember(member: WorkspaceMemberDto): WorkspaceMember {
  return {
    id: member.id,
    userId: member.user_id,
    email: member.email,
    phone: member.phone,
    role: mapRole(member.role),
    status: member.status,
    name: member.name,
    initials: initials(member.name),
    color: colorFor(member.user_id),
  };
}

export function mapWorkspace(workspace: WorkspaceDto): Workspace {
  const updated = workspace.updated_at ?? workspace.created_at;
  return {
    id: workspace.id,
    name: workspace.name,
    description: workspace.description ?? "",
    status: workspace.status,
    role: mapRole(workspace.role),
    taskCount: workspace.task_count,
    memberCount: workspace.member_count,
    members: workspace.members.map(mapMember),
    updatedAt: new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(updated)),
  };
}

function mapStatus(status: ApiTaskStatus): StatusKey {
  if (status === "in_progress") return "progress";
  if (status === "done") return "done";
  if (["in_review", "review", "rejected", "overdue"].includes(status)) {
    return "review";
  }
  return "todo";
}

function mapPriority(priority: number): Priority {
  if (priority >= 4) return "high";
  if (priority <= 2) return "low";
  return "medium";
}

export function priorityValue(priority: Priority): number {
  return priority === "high" ? 5 : priority === "low" ? 1 : 3;
}

export function apiStatus(status: StatusKey): ApiTaskStatus {
  if (status === "progress") return "in_progress";
  if (status === "review") return "in_review";
  return status;
}

export function mapTask(task: TaskDto): Task {
  const assignees = task.assignees.map((assignee) => ({
    memberId: assignee.member_id,
    userId: assignee.user_id,
    email: assignee.email,
    name: assignee.name,
    initials: initials(assignee.name),
    color: colorFor(assignee.user_id),
  }));
  const startAt = new Date(task.start_at);
  const endAt = new Date(task.end_at);
  const dateTimeFormatter = new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  });
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    priority: mapPriority(task.priority),
    status: mapStatus(task.status),
    startAt: dateTimeFormatter.format(startAt),
    deadline: dateTimeFormatter.format(endAt),
    days: Math.max(0, Math.ceil((endAt.getTime() - Date.now()) / 86_400_000)),
    assignees,
    memberIds: task.member_ids,
    workspaceId: task.workspace_id,
    workspaceName: task.workspace_name,
  };
}
