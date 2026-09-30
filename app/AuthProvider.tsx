"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "./MobxProvider";
import { AUTH_SESSION_EXPIRED_EVENT } from "@/src/common/request";
import { toast } from "@/src/common/toast";
import type { LoginRequest } from "@/src/types/auth.types";
import type { User } from "@/src/types/user.types";
import { LocalStorageService } from "@/src/utils/localStorage.service";

type UserContextType = {
  user: User | null;
  loading: boolean;
  login: (form: LoginRequest) => Promise<boolean>;
  refreshUser: () => Promise<void>;
  logOut: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { authStore } = useStore();
  const pathname = usePathname();
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    const response = await authStore.me();
    setUser(response.data);
  }, [authStore]);

  const login = useCallback(
    async (form: LoginRequest): Promise<boolean> => {
      const response = await authStore.login(form);
      if (!response) return false;

      setUser(response.data.user);
      router.replace("/");
      router.refresh();
      return true;
    },
    [authStore, router],
  );

  const logOut = useCallback(async () => {
    try {
      await authStore.logOut();
    } finally {
      setUser(null);
      router.replace("/auth");
      router.refresh();
    }
  }, [authStore, router]);

  useEffect(() => {
    let active = true;

    async function bootstrapSession() {
      try {
        if (!LocalStorageService.get<string>("accessToken")) {
          await authStore.refreshSession();
        }
        const response = await authStore.me();
        if (active) setUser(response.data);
      } catch {
        LocalStorageService.remove("accessToken");
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    void bootstrapSession();
    return () => {
      active = false;
    };
  }, [authStore]);

  useEffect(() => {
    if (loading) return;

    if (!user && pathname !== "/auth") {
      router.replace("/auth");
      return;
    }

    if (user && pathname === "/auth") {
      router.replace("/");
    }
  }, [loading, pathname, router, user]);

  useEffect(() => {
    function expireSession() {
      setUser(null);
      setLoading(false);
      toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
      router.replace("/auth");
    }

    function syncSession(event: StorageEvent) {
      if (event.key !== "accessToken") return;
      if (event.newValue === null) {
        setUser(null);
        router.replace("/auth");
        return;
      }
      void refreshUser().catch(() => expireSession());
    }

    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, expireSession);
    window.addEventListener("storage", syncSession);
    return () => {
      window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, expireSession);
      window.removeEventListener("storage", syncSession);
    };
  }, [refreshUser, router]);

  const value = useMemo(
    () => ({ user, loading, login, refreshUser, logOut }),
    [user, loading, login, refreshUser, logOut],
  );
  const canRender =
    !loading &&
    ((pathname === "/auth" && !user) || (pathname !== "/auth" && Boolean(user)));

  return (
    <UserContext.Provider value={value}>
      {canRender ? children : null}
    </UserContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useAuth phải được sử dụng bên trong AuthProvider");
  }
  return context;
}
