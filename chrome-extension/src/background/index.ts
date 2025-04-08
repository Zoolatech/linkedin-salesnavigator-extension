import 'webextension-polyfill';
import { exampleThemeStorage } from '@extension/storage';
import { externalMessageSchema, parserModelLinkedin } from '@extension/shared';
import { processXHR } from './parser';

exampleThemeStorage.get().then(theme => {
  console.log('theme', theme);
});

chrome.runtime.onMessageExternal.addListener((message, sender) => {
  try {
    const parsed = externalMessageSchema.parse(message);
    if (parsed.type === 'XHR') {
      parsed.data.url = new URL(parsed.data.url || '', sender.url).toString();
      processXHR(parserModelLinkedin, parsed.data);
    }
  } catch (error) {
    console.error('Error processing external message:', error);
  }
});

console.log('Background loaded');
