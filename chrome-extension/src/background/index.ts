import 'webextension-polyfill';
import { configStorage } from '@extension/storage';
import { parserModelLinkedin } from '@extension/shared';
import { externalMessageSchema, type RecordedData } from '@extension/shared-types';
import { processXHR } from './parser';

// TODO: Pass fetch buffer size from content script
// TODO: Display progress in side panel and popup and icon
// TODO: Add start/stop recording flag
// TODO: Add clear storage button
// TODO: Display records in side panel and info popup
// TODO: Add csv export and copy to clipboard functionality
// TODO: Add start/stop logging button

configStorage.get().then(config => {
  console.log('config', config);
});

const recorder: RecordedData = {
  entity: {},
  fetched: [],
};

chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  try {
    const parsed = externalMessageSchema.parse(message);
    if (parsed.type === 'XHR') {
      if (configStorage.getSnapshot()?.recording) {
        parsed.data.url = new URL(parsed.data.url || '', sender.url).toString();
        sendResponse(processXHR(parserModelLinkedin, parsed.data, recorder));
      } else {
        sendResponse([]);
      }
    } else if (parsed.type === 'FETCH_PROGRESS') {
      const progress = parsed.data.left;
      console.log('Fetch progress:', progress);
      sendResponse({ status: 'ok' });
    }
  } catch (error) {
    console.error('Error processing external message:', error);
    sendResponse([]);
  }
});

console.log('Background loaded');
