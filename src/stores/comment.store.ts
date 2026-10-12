import { makeAutoObservable, runInAction } from "mobx";
import type { Socket } from "socket.io-client";
import type { CommentData, CommentDto } from "../features/dashboard/types";
import { commentService, type CommentService } from "../services/comment.service";
import { ErrorHandler } from "../utils/errorHandler";

export class CommentStore {
  comments: CommentDto[] = [];
  loadingComments = false;
  commentsError: string | null = null;
  private activeTaskId: string | null = null;
  private activeWorkspaceId: string | null = null;

  constructor(private service: CommentService = commentService) {
    makeAutoObservable<this, "service" | "activeTaskId" | "activeWorkspaceId">(
      this,
      { service: false, activeTaskId: false, activeWorkspaceId: false },
      { autoBind: true },
    );
  }

  private handleError(error: unknown) {
    const message = String(ErrorHandler.getErrorMessage(error));
    runInAction(() => {
      this.commentsError = message;
    });
    ErrorHandler.errorHandler(message);
  }

  loadComments = async (taskId: string, workspaceId: string) => {
    this.activeTaskId = taskId;
    this.activeWorkspaceId = workspaceId;
    this.loadingComments = true;
    this.commentsError = null;
    this.comments = [];
    try {
      const comments = await this.service.getComments(taskId, workspaceId);
      runInAction(() => {
        if (
          this.activeTaskId === taskId &&
          this.activeWorkspaceId === workspaceId
        ) {
          this.comments = comments;
        }
      });
      return true;
    } catch (error) {
      if (
        this.activeTaskId !== taskId ||
        this.activeWorkspaceId !== workspaceId
      ) {
        return false;
      }
      this.handleError(error);
      return false;
    } finally {
      runInAction(() => {
        if (
          this.activeTaskId === taskId &&
          this.activeWorkspaceId === workspaceId
        ) {
          this.loadingComments = false;
        }
      });
    }
  };

  listenForComments = (socket: Socket, taskId: string, workspaceId: string) => {
    this.activeTaskId = taskId;
    this.activeWorkspaceId = workspaceId;

    const handleNewComment = (comment: CommentDto) => {
      if (
        comment.task_id !== taskId ||
        comment.workspace_id !== workspaceId
      ) {
        return;
      }
      if (!comment.userName?.trim()) {
        void this.loadComments(taskId, workspaceId);
        return;
      }
      runInAction(() => {
        if (!this.comments.some((item) => item.id === comment.id)) {
          this.comments.push(comment);
        }
      });
    };

    socket.on("newComment", handleNewComment);
    return () => {
      socket.off("newComment", handleNewComment);
    };
  };

  submitComment = (socket: Socket, data: CommentData) => {
    try {
      socket.emit("commented", data);
      return true;
    } catch (error) {
      this.handleError(error);
      return false;
    }
  };
}
