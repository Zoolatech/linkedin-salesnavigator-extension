import 'webextension-polyfill';
import { configStorage, recordingStorage } from '@extension/storage';
import { parserModelLinkedin } from '@extension/shared';
import { externalMessageSchema, type XHRRequest, type XHRResponseHeader } from '@extension/shared-types';
import { processXHR } from './parser';

// TODO: Display records in info popup

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
      if (!config?.recording) {
        return;
      }

      const data = parsed.data;

      recordingStorage.get().then(recording => {
        const fetcher = {
          done: new Set<string>(recording.fetcher.done),
          errors: new Map<string, XHRResponseHeader>(recording.fetcher.error.map(e => [e.url ?? '', e])),
          progress: new Map<string, XHRRequest>(recording.fetcher.progress.map(p => [p.url ?? '', p])),
        };

        const originalUrl = data.url ?? '';

        if (fetcher.progress.has(originalUrl)) {
          fetcher.progress.delete(originalUrl);
          if (data.responseStatus !== 200) {
            fetcher.errors.set(originalUrl, data);
            console.error('Error fetching URL', originalUrl, data.responseStatus);
            return;
          } else {
            fetcher.done.add(originalUrl);
          }
        }

        parsed.data.url = new URL(parsed.data.url || '', sender.url).toString();
        const toFetch = processXHR(parserModelLinkedin, parsed.data, recording.entity, config);

        if (config?.digging) {
          toFetch
            .filter(f => !fetcher.done.has(f) && !fetcher.errors.has(f) && !fetcher.progress.has(f))
            .forEach(f => {
              fetcher.progress.set(f, { ...data, url: f });
            });
        }

        recording.fetcher = {
          done: Array.from(fetcher.done.keys()),
          error: Array.from(fetcher.errors.values()),
          progress: Array.from(fetcher.progress.values()),
        };

        recordingStorage.set(recording);
      });
    } else if (parsed.type === 'WORKER') {
      if (!config?.recording) {
        sendResponse([]);
      } else {
        recordingStorage.get().then(recording => {
          sendResponse(recording.fetcher.progress);
        });
      }
    }
  } catch (error) {
    console.error('Error processing external message:', error);
  }
});

let windowId: number;
chrome.tabs.onActivated.addListener(activeInfo => {
  windowId = activeInfo.windowId;
});

chrome.runtime.onMessage.addListener(async message => {
  if (message.action === 'open_side_panel') {
    if (windowId !== undefined) {
      await chrome.sidePanel.open({ windowId });
    }
  }
});

console.log('Background loaded');
