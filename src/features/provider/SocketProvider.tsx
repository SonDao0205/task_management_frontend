"use client";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthProvider";
import { io, Socket } from "socket.io-client";
import { ErrorHandler } from "@/src/utils/errorHandler";
import { useLoading } from "./LoadingProvider";
import { usePathname, useRouter } from "next/navigation";

export type SocketCommentData = {
  text: string;
  userId: string;
  taskId: string;
  workspaceId: string;
  parentCommentId?: string;
};

type SocketContextType = {
  socket: Socket | null;
};

const SocketContext = createContext<SocketContextType | null>(null);

export default function SocketProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { setLoading } = useLoading();
  const router = useRouter();
  const pathName = usePathname();
  const [socket, setSocket] = useState<Socket | null>(null);
  useEffect(() => {
    if (!user) {
      setSocket(null);
      setLoading("socket", false);
      return;
    }

    setLoading("socket", true);
    let settled = false;
    const socket = io("http://localhost:8080", { autoConnect: false });
    const finishInitialConnect = () => {
      if (settled) return;
      settled = true;
      clearTimeout(connectTimeout);
      setLoading("socket", false);
    };
    const connectTimeout = setTimeout(finishInitialConnect, 10000);
    socket.on("connection", finishInitialConnect);
    socket.on("connect_error", (error) => {
      finishInitialConnect();
      ErrorHandler.errorHandler("Không thể kết nối đến máy chủ!.");

      console.log("error : ", ErrorHandler.getErrorMessage(error));
    });
    socket.connect();
    setSocket(socket);

    return () => {
      clearTimeout(connectTimeout);
      socket.removeAllListeners();
      socket.disconnect();
      setLoading("socket", false);
    };
  }, [user, setLoading]);

  const value = useMemo(() => ({ socket }), [socket]);
  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

export const useSocket = () => {
  const context = useContext(SocketContext);

  if (!context) {
    throw new Error("useSocket phải được sử dụng bên trong SocketProvider");
  }
  return context;
};
