import { API } from "../common/api";
import { request } from "../common/request";
import type { CommentDto } from "../features/dashboard/types";

type CommentResponse = Omit<CommentDto, "userName"> & {
  name?: string;
  userName?: string;
};

export class CommentService {
  getComments = async (taskId: string, workspaceId: string) => {
    const comments = (
      await request.get<CommentResponse[]>(
        API.COMMENTS.LIST(taskId, workspaceId),
      )
    ).data;

    return comments.map((comment): CommentDto => {
      return { ...comment, userName: String(comment.name?.trim()) };
    });
  };
}
export const commentService = new CommentService();
