import { z } from 'zod';

import { type BaseStorage, StorageEnum, createStorageChecked } from '../base/index.js';

export const currentConfigSchema = z
  .object({
    recording: z.boolean().default(false),
    digging: z.boolean().default(true),
    logging: z.boolean().default(false),
    theme: z.enum(['light', 'dark']).default('light'),
  })
  .optional()
  .default({
    recording: false,
    digging: true,
    logging: false,
    theme: 'light',
  });

export type Config = z.infer<typeof currentConfigSchema>;

export function configInitialState() {
  return currentConfigSchema.parse(undefined satisfies z.input<typeof currentConfigSchema>);
}

type ConfigStorage = BaseStorage<Config> & {
  toggleRecording: () => Promise<void>;
  toggleDigging: () => Promise<void>;
  toggleLogging: () => Promise<void>;
  toggleTheme: () => Promise<void>;
};

const storage = createStorageChecked('config', currentConfigSchema, currentConfigSchema.parse(undefined), {
  storageEnum: StorageEnum.Local,
  liveUpdate: true,
});

export const configStorage: ConfigStorage = {
  ...storage,
  toggleRecording: async () => {
    await storage.set(currentConfig => {
      return {
        ...currentConfig,
        recording: !currentConfig.recording,
      };
    });
  },
  toggleDigging: async () => {
    await storage.set(currentConfig => {
      return {
        ...currentConfig,
        digging: !currentConfig.digging,
      };
    });
  },
  toggleLogging: async () => {
    await storage.set(currentConfig => {
      return {
        ...currentConfig,
        logging: !currentConfig.logging,
      };
    });
  },
  toggleTheme: async () => {
    await storage.set(currentConfig => {
      return {
        ...currentConfig,
        theme: currentConfig.theme === 'light' ? 'dark' : 'light',
      };
    });
  },
};
