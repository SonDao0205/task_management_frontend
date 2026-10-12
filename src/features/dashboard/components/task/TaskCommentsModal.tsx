"use client";

import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import styles from "@/app/page.module.css";
import type { CommentData, Task } from "../../types";
import { Modal } from "../modal";
import { Avatar } from "../ui";
import { useSocket } from "@/src/features/provider/SocketProvider";
import { useAuth } from "@/src/features/provider/AuthProvider";
import { useStore } from "@/src/features/provider/MobxProvider";

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part[0] ?? "")
    .join("")
    .toLocaleUpperCase("vi");
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export const TaskCommentsModal = observer(function TaskCommentsModal({
  task,
  onClose,
}: {
  task: Task;
  onClose: () => void;
}) {
  const { commentStore } = useStore();
  const {
    comments,
    loadingComments: loading,
    commentsError: error,
  } = commentStore;
  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const { socket } = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    void commentStore.loadComments(task.id, task.workspaceId);
  }, [commentStore, task.id, task.workspaceId]);

  useEffect(() => {
    if (!socket) return;
    return commentStore.listenForComments(socket, task.id, task.workspaceId);
  }, [commentStore, socket, task.id, task.workspaceId]);

  function addComment() {
    const content = draft.trim();
    if (!content || !socket || !user) return;

    const data: CommentData = {
      created_by: String(user.id),
      workspace_id: task.workspaceId,
      task_id: task.id,
      content,
      parent_id: replyTo,
    };
    if (commentStore.submitComment(socket, data)) {
      setDraft("");
      setReplyTo(null);
    }
  }

  function renderThread(parentId: string | null, depth = 0): React.ReactNode[] {
    return comments
      .filter((comment) => comment.parent_id === parentId)
      .flatMap((comment) => {
        const name = comment.userName;
        return [
          <article
            className={`${styles.taskComment} ${depth ? styles.taskCommentReply : ""}`}
            key={comment.id}
            style={{ marginLeft: `${Math.min(depth, 5) * 28}px` }}
          >
            <Avatar
              person={{ name, initials: initials(name), color: "blue" }}
              size="small"
            />
            <div className={styles.commentBody}>
              <div className={styles.commentMeta}>
                <strong>{name}</strong>
                <time>{formatDate(comment.created_at)}</time>
              </div>
              <p>{comment.content}</p>
              <button
                type="button"
                className={styles.commentReplyButton}
                onClick={() => setReplyTo(comment.id)}
              >
                Trả lời
              </button>
            </div>
          </article>,
          ...renderThread(comment.id, depth + 1),
        ];
      });
  }

  return (
    <Modal
      title={`Bình luận · ${task.title}`}
      subtitle={`#${task.id}`}
      onClose={onClose}
    >
      <section
        className={styles.taskComments}
        aria-label={`Bình luận của task ${task.title}`}
      >
        <div className={styles.taskCommentsHeading}>
          <strong>Bình luận</strong>
          {!loading && <span>{comments.length}</span>}
        </div>
        <div className={styles.commentList}>
          {loading ? (
            <p>Đang tải bình luận...</p>
          ) : error ? (
            <p role="alert">{error}</p>
          ) : comments.length ? (
            renderThread(null)
          ) : (
            <p></p>
          )}
        </div>
        <div className={styles.commentComposer}>
          {replyTo !== null && (
            <div className={styles.replyingTo}>
              Đang trả lời bình luận
              <button type="button" onClick={() => setReplyTo(null)}>
                Hủy
              </button>
            </div>
          )}
          <textarea
            aria-label={replyTo === null ? "Viết bình luận" : "Viết trả lời"}
            placeholder={
              replyTo === null
                ? "Viết bình luận cho task này..."
                : "Viết câu trả lời..."
            }
            rows={2}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          <button
            type="button"
            className={`${styles.button} ${styles.primaryButton}`}
            disabled={!draft.trim() || !socket || !user}
            onClick={addComment}
          >
            {replyTo === null ? "Bình luận" : "Trả lời"}
          </button>
        </div>
      </section>
    </Modal>
  );
});
