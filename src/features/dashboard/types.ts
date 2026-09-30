export type Priority = "high" | "medium" | "low";
export type StatusKey = "todo" | "progress" | "review" | "done";
export type Role = "Owner" | "Master" | "Member";

export type AvatarData = {
  initials: string;
  color: string;
  name: string;
};

export type Workspace = {
  id: number;
  name: string;
  role: Role;
  taskCount: number;
  updatedAt: string;
  memberCount: number;
  members: AvatarData[];
};

export type Task = {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: StatusKey;
  deadline: string;
  days: number;
  assignee: AvatarData;
  tag?: string;
};

export type MyTaskWorkspace = {
  id: number;
  name: string;
  tasks: Task[];
};

export type TaskDraft = Pick<
  Task,
  "title" | "description" | "priority" | "status" | "deadline"
>;
