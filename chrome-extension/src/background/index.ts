import 'webextension-polyfill';
import { configStorage } from '@extension/storage';
import { externalMessageSchema, parserModelLinkedin } from '@extension/shared';
import { processXHR, type RecordedData } from './parser';

// TODO: Pass fetch buffer size from content script
// TODO: Display progress in side panel and popup and icon
// TODO: Add start/stop recording flag
// TODO: Add clear storage button
// TODO: Display records in side panel and info popup
// TODO: Add csv export and copy to clipboard functionality
// TODO: Add start/stop logging button

configStorage.get().then(theme => {
  console.log('theme', theme);
});

const recorder: RecordedData = {
  entity: {},
  fetched: [],
};

let recording = false;
export function toggleRecording() {
  recording = !recording;
}

chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  try {
    const parsed = externalMessageSchema.parse(message);
    if (parsed.type === 'XHR') {
      parsed.data.url = new URL(parsed.data.url || '', sender.url).toString();
      if (recording) sendResponse(processXHR(parserModelLinkedin, parsed.data, recorder));
      sendResponse([]);
    }
  } catch (error) {
    console.error('Error processing external message:', error);
    sendResponse([]);
  }
});

console.log('Background loaded');
