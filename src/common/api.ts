export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "";

export const API = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    ME: "/auth/me",
    REFRESH: "/auth/refresh",
    LOGOUT: "/auth/logout",
  },
  USERS: {
    CHANGE_PASSWORD: "/users/me/password",
  },
  WORKSPACES: {
    LIST: "/workspaces",
    DETAIL: (workspaceId: string) => `/workspaces/${workspaceId}`,
    MEMBERS: (workspaceId: string) => `/workspaces/${workspaceId}/members`,
    MEMBER: (workspaceId: string, memberId: string) =>
      `/workspaces/${workspaceId}/members/${memberId}`,
    TASKS: (workspaceId: string) => `/workspaces/${workspaceId}/tasks`,
  },
  TASKS: {
    CREATE: "/tasks",
    MY_TASKS: "/tasks/me",
    DETAIL: (taskId: string) => `/tasks/${taskId}`,
    ASSIGNEES: (taskId: string) => `/tasks/${taskId}/assignees`,
  },
};
