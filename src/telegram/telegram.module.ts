import { HttpModule } from '@nestjs/axios';
import { Module, DynamicModule, Provider } from '@nestjs/common';
import { TELEGRAM_MODULE_OPTIONS } from './constants';
import {
  TelegramModuleOptions,
  TelegramModuleAsyncOptions,
} from './interfaces/telegram-options.interface';
import { TelegramService } from './telegram.service';

@Module({})
export class TelegramModule {
  static forRoot(options: TelegramModuleOptions): DynamicModule {
    return {
      module: TelegramModule,
      global: true,
      imports: [HttpModule],
      providers: [
        {
          provide: TELEGRAM_MODULE_OPTIONS,
          useValue: options,
        },
        TelegramService,
      ],
      exports: [TelegramService],
    };
  }
  static forRootAsync(options: TelegramModuleAsyncOptions): DynamicModule {
    return {
      module: TelegramModule,
      imports: options.imports || [],
      providers: this.createAsyncProviders(options),
    };
  }
  private static createAsyncProviders(
    options: TelegramModuleAsyncOptions,
  ): Provider[] {
    return [
      {
        provide: TELEGRAM_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      },
      TelegramService,
    ];
  }
}
