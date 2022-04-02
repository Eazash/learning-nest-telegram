import { Injectable, Inject } from '@nestjs/common';
import { TELEGRAM_MODULE_OPTIONS } from './constants';
import { TelegramModuleOptions } from './interfaces/telegram-options.interface';

@Injectable()
export class TelegramService {
  private readonly botkey;
  constructor(
    @Inject(TELEGRAM_MODULE_OPTIONS) private options: TelegramModuleOptions,
  ) {
    this.botkey = options.botkey;
  }
}
