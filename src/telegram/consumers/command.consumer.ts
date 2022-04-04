import { Process, Processor } from '@nestjs/bull';
import { Injectable, Scope } from '@nestjs/common';
import { Job } from 'bull';
import { firstValueFrom } from 'rxjs';
import * as Telegram from '../interfaces/telegram-api.interface';
import { TelegramService } from '../telegram.service';

@Injectable()
@Processor({
  name: 'command',
  scope: Scope.REQUEST,
})
export class CommandConsumer {
  constructor(private readonly telegramService: TelegramService) {}
  @Process()
  async greet(job: Job<Telegram.Message>) {
    const message = job.data;
    await firstValueFrom(
      this.telegramService.sendMessage({
        chat_id: message.chat.id,
        text: `Welcome to my bot ${message.from.username}`,
      }),
    );
    return {};
  }
}
