import type { BaseStorage } from '../base/index.js';
import { createStorage, StorageEnum } from '../base/index.js';

type Theme = 'light' | 'dark';
type Config = {
  theme: Theme;
  recording: boolean;
  logging: boolean;
  digging: boolean;
};

type ConfigStorage = BaseStorage<Config> & {
  toggleTheme: () => Promise<void>;
  toggleRecording: () => Promise<void>;
  toggleLogging: () => Promise<void>;
};

const storage = createStorage<Config>(
  'config-storage-key',
  { theme: 'light', recording: false, logging: false, digging: false },
  {
    storageEnum: StorageEnum.Local,
    liveUpdate: true,
  },
);

// You can extend it with your own methods
export const configStorage: ConfigStorage = {
  ...storage,
  toggleTheme: async () => {
    await storage.set(currentConfig => {
      return {
        ...currentConfig,
        theme: currentConfig.theme === 'light' ? 'dark' : 'light',
      };
    });
  },
  toggleRecording: async () => {
    await storage.set(currentConfig => {
      return {
        ...currentConfig,
        recording: !currentConfig.recording,
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
};
