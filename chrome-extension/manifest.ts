import { EXTENSION_KEY } from '@extension/env';
import { readFileSync } from 'node:fs';

const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));

/**
 * @prop default_locale
 * if you want to support multiple languages, you can use the following reference
 * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Internationalization
 *
 * @prop browser_specific_settings
 * Must be unique to your extension to upload to addons.mozilla.org
 * (you can delete if you only want a chrome extension)
 *
 * @prop permissions
 * Firefox doesn't support sidePanel (It will be deleted in manifest parser)
 *
 * @prop content_scripts
 * css: ['content.css'], // public folder
 */
const manifest = {
  manifest_version: 3,
  default_locale: 'en',
  name: '__MSG_extensionName__',
  key: EXTENSION_KEY,
  browser_specific_settings: {
    gecko: {
      id: 'example@example.com',
      strict_min_version: '109.0',
    },
  },
  version: packageJson.version,
  description: '__MSG_extensionDescription__',
  host_permissions: ['*://*.linkedin.com/*'],
  // host_permissions: ['<all_urls>'],
  permissions: ['storage', 'scripting', 'tabs', 'notifications', 'sidePanel', 'clipboardWrite', 'downloads'],
  background: {
    service_worker: 'background.js',
    type: 'module',
  },
  action: {
    default_popup: 'popup/index.html',
    default_icon: 'Zoolatech_Icon_Light_128.png',
  },
  chrome_url_overrides: {},
  icons: {
    '16': 'Zoolatech_Icon_Light_16.png',
    '32': 'Zoolatech_Icon_Light_32.png',
    '48': 'Zoolatech_Icon_Light_48.png',
    '128': 'Zoolatech_Icon_Light_128.png',
  },
  content_scripts: [
    {
      matches: ['*://*.linkedin.com/*'],
      // matches: ['http://*/*', 'https://*/*', '<all_urls>'],
      js: ['content/index.iife.js'],
      run_at: 'document_start',
      world: 'MAIN',
    },
    {
      matches: ['*://*.linkedin.com/*'],
      // matches: ['http://*/*', 'https://*/*', '<all_urls>'],
      css: ['content.css'],
    },
  ],
  web_accessible_resources: [
    {
      matches: ['*://*.linkedin.com/*'],
      // matches: ['*://*/*'],
      resources: ['*.js', '*.css', '*.svg', 'icon-128.png', 'icon-34.png'],
    },
  ],
  side_panel: {
    default_path: 'side-panel/index.html',
  },
  externally_connectable: {
    matches: ['*://*.linkedin.com/*'],
    // matches: ['<all_urls>'],
  },
} satisfies chrome.runtime.ManifestV3;

export default manifest;
