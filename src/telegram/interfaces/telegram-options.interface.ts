import { ModuleMetadata } from '@nestjs/common';

export type TelegramModuleOptions = {
  botkey: string;
};

export interface TelegramModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  name?: string;
  useFactory: (
    ...args: any[]
  ) => TelegramModuleOptions | Promise<TelegramModuleOptions>;
  inject?: any[];
}
