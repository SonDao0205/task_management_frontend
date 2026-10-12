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
        `${API.COMMENTS.LIST}/${taskId}/${workspaceId}`,
      )
    ).data;

    return comments.map((comment): CommentDto => {
      const userName = comment.userName?.trim() || comment.name?.trim();
      if (!userName) {
        throw new Error(`Không nhận được tên người bình luận (${comment.id}).`);
      }
      return { ...comment, userName };
    });
  };
}
export const commentService = new CommentService();
