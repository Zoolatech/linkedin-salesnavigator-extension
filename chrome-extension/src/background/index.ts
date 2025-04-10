import 'webextension-polyfill';
import { configStorage, recordingStorage } from '@extension/storage';
import { parserModelLinkedin } from '@extension/shared';
import { externalMessageSchema } from '@extension/shared-types';
import { processXHR } from './parser';

// TODO: Display progress in side panel and popup and icon
// TODO: Add clear storage button
// TODO: Display records in side panel and info popup
// TODO: Add csv export and copy to clipboard functionality

configStorage.get().then(data => {
  console.log('Startup config', data);
});

recordingStorage.get().then(data => {
  console.log('Startup recording', data);
});

chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  try {
    const config = configStorage.getSnapshot();
    const parsed = externalMessageSchema.parse(message);
    if (parsed.type === 'XHR') {
      if (config?.recording) {
        recordingStorage.get().then(recording => {
          parsed.data.url = new URL(parsed.data.url || '', sender.url).toString();
          const toFetch = processXHR(parserModelLinkedin, parsed.data, recording.data);
          sendResponse(config?.digging ? toFetch : []);
          recording.data.fetched.push(...toFetch);
          recordingStorage.recordData(recording.data);
        });
      } else {
        sendResponse([]);
      }
    } else if (parsed.type === 'FETCH_PROGRESS') {
      const progress = parsed.data.left;
      if (config?.logging) console.log('Fetch progress:', progress);
      recordingStorage.toFetchLeft(progress);
      sendResponse({ status: 'ok' });
    }
  } catch (error) {
    console.error('Error processing external message:', error);
    sendResponse([]);
  }
});

console.log('Background loaded');
