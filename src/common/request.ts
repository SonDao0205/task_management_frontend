import axios from "axios";
import { showToast } from "nextjs-toast-notify";
import { ApiResponseData } from "../types/response.types";

class Request {
  errorHandler = (message: string | string[]) => {
    showToast.error(Array.isArray(message) ? message.join(", ") : message);
  };

  getErrorMessage = (error: unknown): string | string[] => {
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

  get = async <T>(url: string): Promise<ApiResponseData<T> | null> => {
    try {
      const response = await axios.get<ApiResponseData<T>>(url);
      const data = response.data;
      if (data.success === false) {
        this.errorHandler(data.message);
        return null;
      } else {
        return data;
      }
    } catch (error) {
      this.errorHandler(this.getErrorMessage(error));
      return null;
    }
  };

  post = async <T>(url: string, body: T) => {
    try {
      const response = await axios.post(url, body);
      const data = response.data;
      if (data.success === false) {
        this.errorHandler(data.message);
        return null;
      } else {
        return data;
      }
    } catch (error) {
      this.errorHandler(this.getErrorMessage(error));
      return null;
    }
  };
}

export const request = new Request();
