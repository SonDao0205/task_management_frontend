import { API } from "../common/api";
import { request } from "../common/request";

export type ChatUserDto = {
  id: string;
  name: string;
};

export type ChatMessageDto = {
  id: string;
  content: string;
  created_by?: string;
  created_by_id?: string;
  created_by_info?: ChatUserDto;
  group_id?: string;
  group_chat_id?: string;
  created_at: string;
};

export type ChatGroupDto = {
  id: string;
  name: string;
  workspace_id?: string;
  workspace?: { id: string; name: string };
};

export type ChatGroupResponseDto = {
  group_chat: ChatGroupDto;
  latest_message: ChatMessageDto | null;
};

export type CreateChatMessageRequest = {
  content: string;
  created_by_id: string;
  group_chat_id: string;
};

export class ChatService {
  listGroups = async (limit = 50, offset = 0) =>
    (
      await request.get<ChatGroupResponseDto[]>(
        API.GROUPS.LIST(limit, offset),
      )
    ).data;

  listMessages = async (groupId: string, limit = 50, offset = 0) =>
    (
      await request.post<ChatMessageDto[], {
        groupId: string;
        limit: number;
        offset: number;
      }>(API.GROUPS.MESSAGES, { groupId, limit, offset })
    ).data;
}

export const chatService = new ChatService();
