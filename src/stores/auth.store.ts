import { API } from "../common/api";
import { request } from "../common/request";
import { toast } from "../common/toast";
import type {
  ChangePasswordRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "../types/auth.types";
import type { ApiResponseData } from "../types/response.types";
import type { User } from "../types/user.types";
import { ErrorHandler } from "../utils/errorHandler";
import { LocalStorageService } from "../utils/localStorage.service";

function messageText(message: string | string[]): string {
  return Array.isArray(message) ? message.join(", ") : message;
}

export class AuthStore {
  login = async (
    form: LoginRequest,
  ): Promise<ApiResponseData<LoginResponse> | null> => {
    try {
      const data = await request.post<LoginResponse, LoginRequest>(
        API.AUTH.LOGIN,
        form,
      );
      LocalStorageService.set("accessToken", data.data.access_token);
      toast.success(messageText(data.message));
      return data;
    } catch (error) {
      ErrorHandler.errorHandler(ErrorHandler.getErrorMessage(error));
      return null;
    }
  };

  register = async (
    form: RegisterRequest,
  ): Promise<ApiResponseData<RegisterResponse> | null> => {
    try {
      const data = await request.post<RegisterResponse, RegisterRequest>(
        API.AUTH.REGISTER,
        form,
      );
      toast.success(messageText(data.message));
      return data;
    } catch (error) {
      ErrorHandler.errorHandler(ErrorHandler.getErrorMessage(error));
      return null;
    }
  };

  me = (): Promise<ApiResponseData<User>> => request.get<User>(API.AUTH.ME);

  refreshSession = (): Promise<string> => request.refreshSession();

  logOut = async (): Promise<void> => {
    try {
      await request.post<null>(API.AUTH.LOGOUT);
    } finally {
      LocalStorageService.remove("accessToken");
    }
  };

  changePassword = async (
    form: ChangePasswordRequest,
  ): Promise<boolean> => {
    try {
      const data = await request.patch<null, ChangePasswordRequest>(
        API.USERS.CHANGE_PASSWORD,
        form,
      );
      toast.success(messageText(data.message));
      return true;
    } catch (error) {
      ErrorHandler.errorHandler(ErrorHandler.getErrorMessage(error));
      return false;
    }
  };
}
