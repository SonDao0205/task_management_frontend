import { showToast, ToastOptions } from "nextjs-toast-notify";

const defaultOptions = {
  duration: 3000,
  progress: true,
  position: "top-right",
  transition: "popUp",
  sound: false,
} satisfies ToastOptions;

export const toast = {
  success(message: string) {
    showToast.success(message, defaultOptions);
  },

  error(message: string) {
    showToast.error(message, {
      ...defaultOptions,
      duration: 5000,
      transition: "bounceIn",
    });
  },

  warning(message: string) {
    showToast.warning(message, defaultOptions);
  },

  info(message: string) {
    showToast.info(message, defaultOptions);
  },
};
