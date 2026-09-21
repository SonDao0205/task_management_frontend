import { API } from "../common/api";
import { request } from "../common/request";
import { LoginRequest, RegisterRequest } from "../types/auth.types";

export class AuthStore {
  login = async (form: LoginRequest) => {
    const data = await request.post(API.AUTH.LOGIN, form);
    return data;
  };

  register = async (form: RegisterRequest) => {
    const data = await request.post(API.AUTH.REGISTER, form);
    return data;
  };
}
