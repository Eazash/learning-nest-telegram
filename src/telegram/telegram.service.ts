import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { TELEGRAM_MODULE_OPTIONS, TELEGRAM_API_URL } from './constants';
import * as Telegram from './interfaces/telegram-api.interface';
import { TelegramModuleOptions } from './interfaces/telegram-options.interface';
import { AxiosRequestConfig } from 'axios';
import { map, Observable, tap } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { SendMessageParams } from './interfaces/telegram-api.interface';

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
}
