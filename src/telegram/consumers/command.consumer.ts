import { Process, Processor } from '@nestjs/bull';
import { Injectable, Scope, BadRequestException } from '@nestjs/common';
import { Job } from 'bull';
import { join } from 'path';
import { catchError, firstValueFrom, of } from 'rxjs';
import * as Telegram from '../interfaces/telegram-api.interface';
import { TelegramService } from '../telegram.service';

@Injectable()
@Processor({
  name: 'command',
  scope: Scope.REQUEST,
})
export class CommandConsumer {
  constructor(private readonly telegramService: TelegramService) {}
  @Process('greet')
  async greet(job: Job<Telegram.User>) {
    const user = job.data;
    try {
      const message = await firstValueFrom(
        this.telegramService.sendMessage({
          chat_id: user.id,
          text: `Welcome to my bot ${user.username}`,
        }),
      );
      console.log(message);
    } catch (error) {
      console.log(error);
    }
    return {};
  }

  @Process('file')
  async sendFile(job: Job<Telegram.User>) {
    const user = job.data;
    const file_path = join(process.cwd(), 'public', 'image.jpg');
    try {
      await firstValueFrom(
        this.telegramService.sendDocument({ chat_id: user.id, file_path }),
      );
    } catch (error) {
      throw error;
    }
    return {};
  }
  @Process('photo')
  async sendPhoto(job: Job<Telegram.User>) {
    const user = job.data;
    const file_path = join(process.cwd(), 'public', 'image.jpg');
    try {
      await firstValueFrom(
        this.telegramService
          .sendPhoto({ chat_id: user.id, file_path })
          .pipe(catchError((error) => of(error))),
      );
    } catch (error) {
      throw error;
    }
    return {};
  }
  @Process()
  async unknownCommand(job: Job<[string, Telegram.User]>) {
    const [command, user] = job.data;
    await firstValueFrom(
      this.telegramService.sendMessage({
        chat_id: user.id,
        text: `Unknown command '${command}'`,
      }),
    );
  }
}
