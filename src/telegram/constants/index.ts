export const TELEGRAM_MODULE_OPTIONS = 'TELEGRAM_MODULE_OPTIONS';
export const TELEGRAM_API_URL = 'https://api.telegram.org/bot';
export enum UpdateType {
  // TODO: add other types of updates
  MESSAGE = 'message',
  MESSAGE__EDITED = 'edited_message',
  EDITED_CHANNEL_POST = 'edited_channel_post',
}

export enum MessageEntityType {
  MENTION = 'mention',
  HASHTAG = 'hashtag',
  CASHTAG = 'cashtag',
  COMMAND = 'bot_command',
  URL = 'url',
  EMAIL = 'email',
}

export enum ChatType {
  PRIVATE = 'private',
  GROUP = 'group',
  SUPERGROUP = 'supergroup',
  CHANNEL = 'channel',
}
