"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { chatService, type ChatMessageDto } from "@/src/services/chat.service";
import { useAuth } from "@/src/features/provider/AuthProvider";
import { useSocket } from "@/src/features/provider/SocketProvider";
import { ErrorHandler } from "@/src/utils/errorHandler";
import styles from "./ChatWidget.module.css";

type Message = {
  id: string;
  text: string;
  time: string;
  senderId: string;
  senderName: string;
};

type Group = {
  id: string;
  name: string;
  initials: string;
  color: "violet" | "blue" | "orange" | "green";
  preview: string;
  messages: Message[];
  loadingMessages: boolean;
};

const colors: Group["color"][] = ["violet", "blue", "orange", "green"];

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "G";
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function mapMessage(message: ChatMessageDto): Message {
  return {
    id: message.id,
    text: message.content,
    time: formatTime(message.created_at),
    senderId:
      message.created_by_id ?? message.created_by_info?.id ?? message.created_by ?? "",
    senderName: message.created_by_info?.name ?? "Thành viên",
  };
}

function BubbleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5 8 8 0 0 1-3.6-.85L4 20l1.35-4.1A7.5 7.5 0 1 1 20 11.5Z" />
      <path d="M8 11.5h.01M12 11.5h.01M16 11.5h.01" />
    </svg>
  );
}

export function ChatWidget() {
  const listRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [listOpen, setListOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();
  const { socket } = useSocket();
  const activeGroup = groups.find((group) => group.id === activeId);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!listOpen) return;
    let active = true;
    async function loadGroups() {
      setLoadingGroups(true);
      try {
        const data = await chatService.listGroups();
        if (!active) return;
        setGroups((current) =>
          data.map(({ group_chat: group, latest_message }, index) => {
            const previous = current.find((item) => item.id === group.id);
            return {
              id: group.id,
              name: group.name,
              initials: getInitials(group.name),
              color: colors[index % colors.length]!,
              preview: latest_message?.content ?? "Chưa có tin nhắn",
              messages: previous?.messages ?? [],
              loadingMessages: previous?.loadingMessages ?? false,
            };
          }),
        );
      } catch (error) {
        ErrorHandler.errorHandler(ErrorHandler.getErrorMessage(error));
      } finally {
        if (active) setLoadingGroups(false);
      }
    }
    void loadGroups();
    return () => {
      active = false;
    };
  }, [listOpen]);

  useEffect(() => {
    function closeListOnOutsideClick(event: PointerEvent) {
      if (!listRef.current?.contains(event.target as Node)) {
        setListOpen(false);
      }
    }
    document.addEventListener("pointerdown", closeListOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeListOnOutsideClick);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeGroup?.messages.length]);

  useEffect(() => {
    if (!socket) return;
    function receiveChatError(data: { message?: string }) {
      ErrorHandler.errorHandler(data.message ?? "Không thể thực hiện thao tác chat!");
    }
    function receiveMessage(dto: ChatMessageDto) {
      const message = mapMessage(dto);
      const groupId = dto.group_chat_id ?? dto.group_id;
      if (!groupId) return;
      setGroups((items) =>
        items.map((group) => {
          if (group.id !== groupId) return group;
          const exists = group.messages.some((item) => item.id === message.id);
          return {
            ...group,
            preview: message.text,
            messages:
              group.id === activeId && !exists
                ? [...group.messages, message]
                : group.messages,
          };
        }),
      );
    }
    socket.on("newMessage", receiveMessage);
    socket.on("chat:error", receiveChatError);
    return () => {
      socket.off("newMessage", receiveMessage);
      socket.off("chat:error", receiveChatError);
    };
  }, [activeId, socket]);

  async function selectGroup(group: Group) {
    setActiveId(group.id);
    setListOpen(false);
    socket?.emit("join-group", { group_chat_id: group.id });
    if (group.messages.length > 0 || group.loadingMessages) return;

    setGroups((items) =>
      items.map((item) =>
        item.id === group.id ? { ...item, loadingMessages: true } : item,
      ),
    );
    try {
      const messages = await chatService.listMessages(group.id);
      setGroups((items) =>
        items.map((item) =>
          item.id === group.id
            ? {
                ...item,
                messages: messages.map(mapMessage).reverse(),
                loadingMessages: false,
              }
            : item,
        ),
      );
    } catch (error) {
      setGroups((items) =>
        items.map((item) =>
          item.id === group.id ? { ...item, loadingMessages: false } : item,
        ),
      );
      ErrorHandler.errorHandler(ErrorHandler.getErrorMessage(error));
    }
  }

  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = draft.trim();
    if (!content || !activeGroup || !user?.id) return;
    if (!socket?.connected) {
      ErrorHandler.errorHandler("Chưa kết nối được đến máy chủ chat!");
      return;
    }
    socket.emit("newMessage", {
      content,
      created_by_id: user.id,
      group_chat_id: activeGroup.id,
    });
    setDraft("");
  }

  return (
    <>
      <div className={styles.triggerWrap} ref={listRef}>
        <button
          className={`${styles.trigger} ${listOpen ? styles.triggerActive : ""}`}
          onClick={() => setListOpen((open) => !open)}
          aria-label="Mở danh sách tin nhắn"
          aria-expanded={listOpen}
        >
          <BubbleIcon />
          <span className={styles.tooltip}>Tin nhắn</span>
        </button>
        {listOpen && (
          <section className={styles.groupPanel} aria-label="Danh sách nhóm chat">
            <div className={styles.listHeader}>
              <div>
                <h2>Tin nhắn</h2>
                <p>Các nhóm của bạn</p>
              </div>
              <span className={styles.groupCount}>{groups.length} nhóm</span>
            </div>
            <div className={styles.groupList}>
              {loadingGroups && <p className={styles.listMessage}>Đang tải nhóm chat...</p>}
              {!loadingGroups && groups.length === 0 && (
                <p className={styles.listMessage}>Bạn chưa có nhóm chat nào.</p>
              )}
              {groups.map((group) => (
                <button
                  key={group.id}
                  className={`${styles.groupItem} ${activeId === group.id ? styles.groupSelected : ""}`}
                  onClick={() => void selectGroup(group)}
                >
                  <span className={`${styles.avatar} ${styles[group.color]}`}>
                    {group.initials}
                  </span>
                  <span className={styles.groupCopy}>
                    <span className={styles.groupName}>{group.name}</span>
                    <span className={styles.groupPreview}>{group.preview}</span>
                  </span>
                </button>
              ))}
            </div>
            <div className={styles.listFooter}>Chọn một nhóm để bắt đầu trò chuyện</div>
          </section>
        )}
      </div>
      {mounted && activeGroup && createPortal(
        <section className={styles.chatWindow} aria-label={`Trò chuyện: ${activeGroup.name}`}>
          <header className={styles.chatHeader}>
            <span className={`${styles.avatar} ${styles[activeGroup.color]}`}>
              {activeGroup.initials}
            </span>
            <span className={styles.chatHeading}>
              <strong>{activeGroup.name}</strong>
              <span className={styles.statusText}>{activeGroup.messages.length} tin nhắn</span>
            </span>
            <button
              className={styles.closeButton}
              onClick={() => setActiveId(null)}
              aria-label="Tắt khung chat"
            >
              <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <path d="m18 6-12 12M6 6l12 12" />
              </svg>
            </button>
          </header>
          <div className={styles.messages}>
            {activeGroup.loadingMessages && <p className={styles.listMessage}>Đang tải tin nhắn...</p>}
            {!activeGroup.loadingMessages && activeGroup.messages.length === 0 && (
              <p className={styles.listMessage}>Chưa có tin nhắn trong nhóm này.</p>
            )}
            {activeGroup.messages.map((message) => {
              const mine = message.senderId === user?.id;
              return (
                <div
                  className={`${styles.messageRow} ${mine ? styles.messageMine : ""}`}
                  key={message.id}
                >
                  {!mine && <span className={`${styles.miniAvatar} ${styles[activeGroup.color]}`}>{getInitials(message.senderName)}</span>}
                  <div className={styles.messageContent}>
                    {!mine && <span className={styles.senderName}>{message.senderName}</span>}
                    <div className={styles.bubble}>{message.text}</div>
                    <div className={styles.messageMeta}>{message.time}</div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
          <form className={styles.composer} onSubmit={sendMessage}>
            <input
              aria-label="Tin nhắn"
              placeholder="Nhập tin nhắn..."
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
            <button type="submit" aria-label="Gửi tin nhắn" disabled={!draft.trim()}>
              <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m22 2-7 20-4-9-9-4Z" />
                <path d="M22 2 11 13" />
              </svg>
            </button>
          </form>
        </section>,
        document.body,
      )}
    </>
  );
}
