import type { BaseStorage } from '../base/index.js';
import { createStorage, StorageEnum } from '../base/index.js';
import { type RecordedData } from '@extension/shared-types';

type CurrentRecording = {
  data: RecordedData;
  toFetchLeft: number;
};

type ConfigStorage = BaseStorage<CurrentRecording> & {
  toFetchLeft: (i: number) => Promise<void>;
  recordData: (data: RecordedData) => Promise<void>;
};

const storage = createStorage<CurrentRecording>(
  'recording',
  { data: { entity: {}, fetched: [] }, toFetchLeft: 0 },
  {
    storageEnum: StorageEnum.Local,
    liveUpdate: true,
  },
);

// You can extend it with your own methods
export const recordingStorage: ConfigStorage = {
  ...storage,
  toFetchLeft: async (i: number) => {
    await storage.set(currentRecording => {
      return {
        ...currentRecording,
        toFetchLeft: i,
      };
    });
  },
  recordData: async (data: RecordedData) => {
    await storage.set(currentRecording => {
      return {
        ...currentRecording,
        data,
      };
    });
  },
};
