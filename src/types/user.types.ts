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
  refresh_token: string;
  created_at: Date;
  updated_at: Date;
};
