"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import styles from "./ChatWidget.module.css";

type Message = {
  id: number;
  text: string;
  time: string;
  mine: boolean;
  status?: "Đã gửi" | "Đã nhận" | "Đã xem";
};
type Group = {
  id: number;
  name: string;
  initials: string;
  color: string;
  online: boolean;
  preview: string;
  unread: number;
  messages: Message[];
};

const initialGroups: Group[] = [
  {
    id: 1,
    name: "Nhóm thiết kế sản phẩm",
    initials: "TK",
    color: "violet",
    online: true,
    preview: "Mình đã cập nhật bản thiết kế nhé.",
    unread: 2,
    messages: [
      {
        id: 1,
        text: "Chào mọi người, mình gửi bản thiết kế mới để cả nhóm xem nhé!",
        time: "09:24",
        mine: false,
      },
      {
        id: 2,
        text: "Mình vừa xem rồi, phần dashboard trông gọn hơn nhiều.",
        time: "09:27",
        mine: true,
        status: "Đã xem",
      },
      {
        id: 3,
        text: "Mình đã cập nhật bản thiết kế nhé.",
        time: "09:31",
        mine: false,
      },
    ],
  },
  {
    id: 2,
    name: "Dự án Website mới",
    initials: "WD",
    color: "blue",
    online: true,
    preview: "Deadline phần landing page là thứ Sáu.",
    unread: 1,
    messages: [
      {
        id: 1,
        text: "Mọi người ơi, deadline phần landing page là thứ Sáu nhé.",
        time: "10:02",
        mine: false,
      },
      {
        id: 2,
        text: "Đã rõ, mình sẽ hoàn thành trước hạn.",
        time: "10:05",
        mine: true,
        status: "Đã nhận",
      },
    ],
  },
  {
    id: 3,
    name: "Marketing Q4",
    initials: "MQ",
    color: "orange",
    online: false,
    preview: "Cảm ơn team, hẹn gặp ngày mai!",
    unread: 0,
    messages: [
      {
        id: 1,
        text: "Mình đã tổng hợp xong nội dung chiến dịch.",
        time: "Hôm qua",
        mine: false,
      },
      {
        id: 2,
        text: "Cảm ơn team, hẹn gặp ngày mai!",
        time: "Hôm qua",
        mine: true,
        status: "Đã xem",
      },
    ],
  },
  {
    id: 4,
    name: "Team phát triển",
    initials: "PT",
    color: "green",
    online: false,
    preview: "Đã merge pull request vào nhánh chính.",
    unread: 0,
    messages: [
      {
        id: 1,
        text: "API phần đăng nhập đã sẵn sàng để tích hợp.",
        time: "08:46",
        mine: false,
      },
      {
        id: 2,
        text: "Đã merge pull request vào nhánh chính.",
        time: "08:52",
        mine: true,
        status: "Đã gửi",
      },
    ],
  },
];

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
  const [groups, setGroups] = useState(initialGroups);
  const [listOpen, setListOpen] = useState(false);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const activeGroup = groups.find((group) => group.id === activeId);

  useEffect(() => {
    function closeListOnOutsideClick(event: PointerEvent) {
      if (!listRef.current?.contains(event.target as Node)) {
        setListOpen(false);
      }
    }
    document.addEventListener("pointerdown", closeListOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeListOnOutsideClick);
  }, []);

  function selectGroup(group: Group) {
    setActiveId(group.id);
    setListOpen(false);
    setGroups((items) =>
      items.map((item) =>
        item.id === group.id ? { ...item, unread: 0 } : item,
      ),
    );
  }

  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || !activeId) return;
    setGroups((items) =>
      items.map((group) =>
        group.id === activeId
          ? {
              ...group,
              preview: text,
              messages: [
                ...group.messages,
                {
                  id: Date.now(),
                  text,
                  time: new Intl.DateTimeFormat("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(new Date()),
                  mine: true,
                  status: "Đã gửi",
                },
              ],
            }
          : group,
      ),
    );
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
          <i className={styles.notificationDot} />
        </button>
        {listOpen && (
          <section
            className={styles.groupPanel}
            aria-label="Danh sách nhóm chat"
          >
            <div className={styles.listHeader}>
              <div>
                <h2>Tin nhắn</h2>
                <p>Các nhóm của bạn</p>
              </div>
              <span className={styles.groupCount}>{groups.length} nhóm</span>
            </div>
            <div className={styles.groupList}>
              {groups.map((group) => (
                <button
                  key={group.id}
                  className={`${styles.groupItem} ${activeId === group.id ? styles.groupSelected : ""}`}
                  onClick={() => selectGroup(group)}
                >
                  <span className={`${styles.avatar} ${styles[group.color]}`}>
                    {group.initials}
                    <i
                      className={`${styles.presence} ${group.online ? styles.online : styles.offline}`}
                    />
                  </span>
                  <span className={styles.groupCopy}>
                    <span className={styles.groupName}>{group.name}</span>
                    <span className={styles.groupPreview}>{group.preview}</span>
                  </span>
                  <span className={styles.groupMeta}>
                    {group.unread > 0 && (
                      <i className={styles.unread}>{group.unread}</i>
                    )}
                  </span>
                </button>
              ))}
            </div>
            <div className={styles.listFooter}>
              Chọn một nhóm để bắt đầu trò chuyện
            </div>
          </section>
        )}
      </div>
      {activeGroup && createPortal((
        <section
          className={styles.chatWindow}
          aria-label={`Trò chuyện: ${activeGroup.name}`}
        >
          <header className={styles.chatHeader}>
            <span className={`${styles.avatar} ${styles[activeGroup.color]}`}>
              {activeGroup.initials}
              <i
                className={`${styles.presence} ${activeGroup.online ? styles.online : styles.offline}`}
              />
            </span>
            <span className={styles.chatHeading}>
              <strong>{activeGroup.name}</strong>
              <span
                className={`${styles.statusText} ${activeGroup.online ? styles.statusOnline : styles.statusOffline}`}
              >
                <i />
                {activeGroup.online ? "Đang hoạt động" : "Ngoại tuyến"}
              </span>
            </span>
            <button
              className={styles.closeButton}
              onClick={() => setActiveId(null)}
              aria-label="Tắt khung chat"
            >
              <svg
                viewBox="0 0 24 24"
                width="19"
                height="19"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <path d="m18 6-12 12M6 6l12 12" />
              </svg>
            </button>
          </header>
          <div className={styles.messages}>
            <div className={styles.dayDivider}>
              <span>Hôm nay</span>
            </div>
            {activeGroup.messages.map((message) => (
              <div
                className={`${styles.messageRow} ${message.mine ? styles.messageMine : ""}`}
                key={message.id}
              >
                {!message.mine && (
                  <span
                    className={`${styles.miniAvatar} ${styles[activeGroup.color]}`}
                  >
                    {activeGroup.initials}
                  </span>
                )}
                <div className={styles.messageContent}>
                  <div className={styles.bubble}>{message.text}</div>
                  <div className={styles.messageMeta}>
                    {message.time}
                    {message.mine && (
                      <>
                        <span className={styles.metaSeparator}>·</span>
                        <span
                          className={
                            message.status === "Đã xem" ? styles.seen : ""
                          }
                        >
                          {message.status === "Đã xem" ? "✓✓" : "✓"}{" "}
                          {message.status}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <form className={styles.composer} onSubmit={sendMessage}>
            <input
              aria-label="Tin nhắn"
              placeholder="Nhập tin nhắn..."
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
            <button
              type="submit"
              aria-label="Gửi tin nhắn"
              disabled={!draft.trim()}
            >
              <svg
                viewBox="0 0 24 24"
                width="19"
                height="19"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m22 2-7 20-4-9-9-4Z" />
                <path d="M22 2 11 13" />
              </svg>
            </button>
          </form>
        </section>
      ), document.body)}
    </>
  );
}
