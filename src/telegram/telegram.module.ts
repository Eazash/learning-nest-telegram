import { HttpModule } from '@nestjs/axios';
import { BullModule, InjectQueue } from '@nestjs/bull';
import {
  DynamicModule,
  Module,
  OnModuleDestroy,
  OnModuleInit,
  Provider,
} from '@nestjs/common';
import { Queue } from 'bull';
import { of, repeat, retry, Subscription, switchMap } from 'rxjs';
import {
  Command,
  MessageEntityType,
  TELEGRAM_MODULE_OPTIONS,
} from './constants';
import { CommandConsumer } from './consumers/command.consumer';
import * as Telegram from './interfaces/telegram-api.interface';
import {
  TelegramModuleAsyncOptions,
  TelegramModuleOptions,
} from './interfaces/telegram-options.interface';
import { TelegramService } from './telegram.service';

@Module({})
export class TelegramModule implements OnModuleInit, OnModuleDestroy {
  private offset: number;
  updates$: Subscription;
  constructor(
    @InjectQueue('command') private commandQueue: Queue,
    private telegramService: TelegramService,
  ) {}
  onModuleDestroy() {
    this.updates$?.unsubscribe();
  }
  onModuleInit() {
    this.updates$ = of({})
      .pipe(
        switchMap((_) => this.telegramService.getUpdates()),
        repeat(),
        retry(3),
      )
      .subscribe({
        next: (updates) =>
          updates.forEach((update) => this.jobProducer(update)),
      });
  }
  private jobProducer(update: Telegram.Update): void {
    if (
      update?.message?.entities?.some(
        (entity) => entity.type === MessageEntityType.COMMAND,
      )
    ) {
      const commandEntity = update.message.entities.find(
        (entity) => entity.type === MessageEntityType.COMMAND,
      );
      const command = update.message.text.substring(
        commandEntity.offset,
        commandEntity.length,
      );
      switch (command) {
        case Command.START:
          this.commandQueue.add('greet', update.message.from);
          break;
        case Command.FILE:
          this.commandQueue.add('file', update.message.from);
          break;
        case Command.PHOTO:
          this.commandQueue.add('photo', update.message.from);
          break;
        default:
          this.commandQueue.add([command, update.message.from]);
          break;
      }
    }
  }
  static forRoot(options: TelegramModuleOptions): DynamicModule {
    return {
      module: TelegramModule,
      global: true,
      imports: [HttpModule, ...this.createQueueModules(['command'])],
      providers: [
        {
          provide: TELEGRAM_MODULE_OPTIONS,
          useValue: options,
        },
        TelegramService,
        CommandConsumer,
      ],
      exports: [TelegramService],
    };
  }
  static forRootAsync(options: TelegramModuleAsyncOptions): DynamicModule {
    return {
      module: TelegramModule,
      imports: [
        ...options.imports,
        HttpModule,
        ...this.createQueueModules(['command']),
      ] || [HttpModule],
      providers: [CommandConsumer, ...this.createAsyncProviders(options)],
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
  private static createQueueModules(names: string[]): DynamicModule[] {
    return names.map((name) =>
      BullModule.registerQueue({
        name,
      }),
    );
  }
}
