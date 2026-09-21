import { User } from "./user.types";

export type RegisterRequest = {
  name: string;
  email: string;
  phone: string;
  password: string;
};

export type LoginRequest = {
  input: string;
  password: string;
};

export type RegisterResponse = {
  name: String;
  email: string;
  phone: string;
};

export type LoginResponse = {
  user: User;
  access_token: string;
  refresh_token: string;
};
