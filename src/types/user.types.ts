export enum UserStatus {
  ACTIVE = "active",
  IN_ACTIVE = "inactive",
  BANNED = "banned",
}

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: UserStatus;
  created_at: string;
  updated_at: string | null;
};
