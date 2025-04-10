import { z } from 'zod';
import type { BaseStorage } from '../base/index.js';
import { createStorage, StorageEnum } from '../base/index.js';
import { recordedDataSchema, type RecordedData } from '@extension/shared-types';

export const currentRecordingSchema = z.object({
  data: recordedDataSchema,
  toFetchLeft: z.number().default(0),
});

export type CurrentRecording = z.infer<typeof currentRecordingSchema>;

export const recordingInitialState: CurrentRecording = {
  data: { entity: {}, fetched: [] },
  toFetchLeft: 0,
};

type ConfigStorage = BaseStorage<CurrentRecording> & {
  toFetchLeft: (i: number) => Promise<void>;
  recordData: (data: RecordedData) => Promise<void>;
};

const storage = createStorage<CurrentRecording>('recording', recordingInitialState, {
  storageEnum: StorageEnum.Local,
  liveUpdate: true,
});

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
