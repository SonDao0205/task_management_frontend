"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useCallback,
  useMemo,
  useState,
} from "react";
import styles from "./LoadingProvider.module.css";

type LoadingContextType = {
  loading: boolean;
  setLoading: (source: string, loading: boolean) => void;
};

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export default function LoadingProvider({ children }: { children: ReactNode }) {
  const [activeSources, setActiveSources] = useState<Record<string, boolean>>({
    auth: true,
  });
  const setLoading = useCallback((source: string, loading: boolean) => {
    setActiveSources((current) => {
      if (current[source] === loading) return current;
      return { ...current, [source]: loading };
    });
  }, []);
  const value = useMemo(
    () => ({ loading: Object.values(activeSources).some(Boolean), setLoading }),
    [activeSources, setLoading],
  );

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {value.loading && (
        <div
          className={styles.backdrop}
          role="status"
          aria-live="polite"
          aria-label="Đang tải"
        >
          <div className={styles.spinner} aria-hidden="true" />
        </div>
      )}
    </LoadingContext.Provider>
  );
}

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading phải được sử dụng bên trong LoadingProvider");
  }
  return context;
};
