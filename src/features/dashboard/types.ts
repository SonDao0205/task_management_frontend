export type Priority = "high" | "medium" | "low";
export type StatusKey = "todo" | "progress" | "review" | "done";
export type Role = "Owner" | "Master" | "Member";
export type ApiRole = "owner" | "master" | "member";
export type ApiTaskStatus =
  | "todo"
  | "in_progress"
  | "overdue"
  | "done"
  | "rejected"
  | "in_review"
  | "review"
  | "bug";

export type AvatarData = {
  initials: string;
  color: string;
  name: string;
};

export type WorkspaceMemberDto = {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  role: ApiRole;
  status: "active" | "inactive" | "banned";
  joined_at: string;
};

export type WorkspaceDto = {
  id: string;
  name: string;
  description: string | null;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string | null;
  role: ApiRole;
  member_count: number;
  task_count: number;
  members: WorkspaceMemberDto[];
};

export type WorkspaceMember = AvatarData & {
  id: string;
  userId: string;
  email: string;
  phone: string;
  role: Role;
  status: "active" | "inactive" | "banned";
};

export type Workspace = {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive";
  role: Role;
  taskCount: number;
  updatedAt: string;
  memberCount: number;
  members: WorkspaceMember[];
};

export type TaskAssigneeDto = {
  member_id: string;
  user_id: string;
  name: string;
  email: string;
};

export type TaskDto = {
  id: string;
  title: string;
  description: string;
  priority: number;
  start_at: string;
  end_at: string;
  status: ApiTaskStatus;
  created_at: string;
  updated_at: string | null;
  created_by: string | null;
  workspace_id: string;
  workspace_name?: string;
  member_ids: string[];
  assignees: TaskAssigneeDto[];
};

export type Task = {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: StatusKey;
  startAt: string;
  deadline: string;
  days: number;
  assignees: (AvatarData & { memberId: string; userId: string; email: string })[];
  memberIds: string[];
  workspaceId: string;
  workspaceName?: string;
  tag?: string;
};

export type MyTaskWorkspace = {
  id: string;
  name: string;
  tasks: Task[];
};

export type TaskDraft = {
  title: string;
  description: string;
  priority: Priority;
  status: StatusKey;
  startAt: string;
  endAt: string;
  memberIds: string[];
};

export const statusKeys: StatusKey[] = ["todo", "progress", "review", "done"];
export const statusMeta: Record<StatusKey, { label: string }> = {
  todo: { label: "To Do" },
  progress: { label: "In Progress" },
  review: { label: "Review" },
  done: { label: "Done" },
};
export const priorityMeta: Record<Priority, string> = {
  high: "Cao",
  medium: "Trung bình",
  low: "Thấp",
};
