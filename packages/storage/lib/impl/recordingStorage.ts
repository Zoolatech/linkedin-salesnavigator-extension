import { type z } from 'zod';
import { type Fetcher, recordedDataSchema } from '@extension/shared-types';
import { type BaseStorage, StorageEnum, createStorageChecked } from '../base/index.js';

export const currentRecordingSchema = recordedDataSchema.optional().default({});

export type CurrentRecording = z.infer<typeof currentRecordingSchema>;

export function recordingInitialState() {
  return currentRecordingSchema.parse(undefined satisfies z.input<typeof currentRecordingSchema>);
}

type RecordingStorage = BaseStorage<CurrentRecording> & {
  updateFetcher: (fetcher: Fetcher) => Promise<void>;
};

const storage = createStorageChecked('recording', currentRecordingSchema, recordingInitialState(), {
  storageEnum: StorageEnum.Local,
  liveUpdate: true,
});

export const recordingStorage: RecordingStorage = {
  ...storage,
  updateFetcher: async (fetcher: Fetcher) => {
    await storage.set(currentRecording => {
      return {
        ...currentRecording,
        fetcher,
      };
    });
  },
};
