import axios from "axios";
import { toast } from "../common/toast";
import { ApiResponseData } from "../types/response.types";

export class ErrorHandler {
  static errorHandler = (message: string | string[]) => {
    toast.error(Array.isArray(message) ? message.join(", ") : message);
  };

  static getErrorMessage = (error: unknown): string | string[] => {
    if (!axios.isAxiosError<ApiResponseData<null>>(error)) {
      return "Lỗi hệ thống!";
    }

    if (!error.response) {
      return "Không thể kết nối đến máy chủ!";
    }

    const message = error.response.data?.message;

    if (
      (typeof message === "string" && message.trim()) ||
      (Array.isArray(message) && message.length > 0)
    ) {
      return message;
    }

    return "Lỗi hệ thống!";
  };
}
