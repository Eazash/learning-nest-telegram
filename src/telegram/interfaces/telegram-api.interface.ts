import { ChatType, MessageEntityType, UpdateType } from '../constants';

export interface GetUpdatesParams {
  offset?: number;
  limit?: number;
  timeout?: number;
  allowed_updates?: UpdateType[];
}

export interface SendMessageParams {
  chat_id: number;
  text: string;
}

export interface SendDocumentParams {
  chat_id: number;
  file_path: string;
}

export interface Update {
  update_id: number;
  message?: Message;
}

export interface Message {
  message_id: number;
  from?: User;
  entities: MessageEntity[];
  text?: string;
  chat: Chat;
}

export interface User {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
}

export interface MessageEntity {
  type: MessageEntityType;
  offset: number;
  length: number;
  url?: string;
  user?: User;
  language?: string;
}

export interface Chat {
  id: number;
  type: ChatType;
}

export interface Bot extends User {
  can_join_group: boolean;
  can_read_all_group_messages: boolean;
  supports_inline_queries: boolean;
}
