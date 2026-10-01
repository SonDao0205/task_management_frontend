"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import styles from "./confirm.module.css";

export type ConfirmVariant = "delete" | "warning" | "success";

export type ConfirmOptions = {
  variant?: ConfirmVariant;
  title?: string;
  message?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  closeOnBackdrop?: boolean;
};

type ConfirmFunction = (options?: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFunction | null>(null);

const defaultContent: Record<
  ConfirmVariant,
  { title: string; message: string }
> = {
  delete: {
    title: "Xóa",
    message: "Bạn có chắc chắn muốn xóa?",
  },
  warning: {
    title: "Cảnh báo",
    message: "Bạn có chắc chắn muốn thực hiện hành động này?",
  },
  success: {
    title: "Thành công",
    message: "Hành động đã được thực hiện thành công!",
  },
};

function ConfirmIcon({ variant }: { variant: ConfirmVariant }) {
  if (variant === "delete") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v5M14 11v5" />
      </svg>
    );
  }

  if (variant === "success") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12 2.5 2.5L16 9" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6M12 17h.01" />
    </svg>
  );
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolverRef = useRef<((accepted: boolean) => void) | null>(null);

  const close = useCallback((accepted: boolean) => {
    resolverRef.current?.(accepted);
    resolverRef.current = null;
    setOptions(null);
  }, []);

  const confirm = useCallback<ConfirmFunction>((nextOptions = {}) => {
    resolverRef.current?.(false);

    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      setOptions(nextOptions);
    });
  }, []);

  useEffect(() => {
    if (!options) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close(false);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [close, options]);

  useEffect(
    () => () => {
      resolverRef.current?.(false);
    },
    [],
  );

  const variant = options?.variant ?? "warning";
  const defaults = defaultContent[variant];
  const showCancel = options?.showCancel ?? variant !== "success";

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {options && (
        <div
          className={styles.backdrop}
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              options.closeOnBackdrop !== false
            ) {
              close(false);
            }
          }}
        >
          <section
            className={styles.modal}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-message"
          >
            <button
              type="button"
              className={styles.closeButton}
              onClick={() => close(false)}
              aria-label="Đóng"
            >
              ×
            </button>

            <span className={`${styles.icon} ${styles[variant]}`}>
              <ConfirmIcon variant={variant} />
            </span>
            <h2 id="confirm-title">{options.title ?? defaults.title}</h2>
            <div id="confirm-message" className={styles.message}>
              {options.message ?? defaults.message}
            </div>

            <div className={styles.actions}>
              {showCancel && (
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => close(false)}
                  autoFocus
                >
                  {options.cancelText ?? "Hủy"}
                </button>
              )}
              <button
                type="button"
                className={`${styles.confirmButton} ${styles[variant]}`}
                onClick={() => close(true)}
                autoFocus={!showCancel}
              >
                {options.confirmText ?? "Xác nhận"}
              </button>
            </div>
          </section>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmFunction {
  const confirm = useContext(ConfirmContext);
  if (!confirm) {
    throw new Error("useConfirm phải được sử dụng bên trong ConfirmProvider");
  }
  return confirm;
}
