import { HttpService } from '@nestjs/axios';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';
import * as FormData from 'form-data';
import { createReadStream } from 'fs';
import { map, Observable, tap } from 'rxjs';
import { TELEGRAM_API_URL, TELEGRAM_MODULE_OPTIONS } from './constants';
import * as Telegram from './interfaces/telegram-api.interface';
import {
  SendDocumentParams,
  SendMessageParams,
} from './interfaces/telegram-api.interface';
import { TelegramModuleOptions } from './interfaces/telegram-options.interface';

@Injectable()
export class TelegramService {
  private readonly botkey: string;
  private readonly url: string;
  private offset: number;
  constructor(
    @Inject(TELEGRAM_MODULE_OPTIONS)
    options: TelegramModuleOptions,
    private readonly http: HttpService,
  ) {
    this.botkey = options.botkey;
    this.url = `${TELEGRAM_API_URL}${this.botkey}/`;
  }

  private makeCall<T>(
    endpoint: string,
    data?: any,
    requestConfig?: AxiosRequestConfig,
  ): Observable<T> {
    return this.http.post(this.url + endpoint, data, requestConfig).pipe(
      map((response) => {
        if (!response.data.ok) {
          throw new InternalServerErrorException(response.data);
        }
        return response.data.result;
      }),
    );
  }
  getUpdates(
    options?: Telegram.GetUpdatesParams,
  ): Observable<Telegram.Update[]> {
    return this.makeCall<Telegram.Update[]>(this.getUpdates.name, {
      offset: this.offset,
      ...options,
    }).pipe(
      tap((updates) => {
        if (updates.length) {
          this.offset = updates.at(-1).update_id + 1;
        }
      }),
    );
  }
  sendMessage(data: SendMessageParams) {
    return this.makeCall<Telegram.Message>(this.sendMessage.name, data);
  }

  sendDocument(data: SendDocumentParams) {
    const payload = new FormData();
    payload.append('chat_id', data.chat_id);
    payload.append('document', createReadStream(data.file_path));
    return this.makeCall<Telegram.Message>(this.sendDocument.name, payload, {
      headers: {
        ...payload.getHeaders(),
      },
    });
  }
  sendPhoto(data: SendDocumentParams) {
    const payload = new FormData();
    payload.append('chat_id', data.chat_id);
    payload.append('photo', createReadStream(data.file_path));
    return this.makeCall<Telegram.Message>(this.sendPhoto.name, payload, {
      headers: {
        ...payload.getHeaders(),
      },
    });
  }
}
