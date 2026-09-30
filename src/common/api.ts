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
};
