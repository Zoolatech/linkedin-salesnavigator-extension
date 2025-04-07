export const IS_DEV = process.env['CLI_CEB_DEV'] === 'true';
export const IS_PROD = !IS_DEV;
export const IS_FIREFOX = process.env['CLI_CEB_FIREFOX'] === 'true';
export const IS_CI = process.env['CEB_CI'] === 'true';
export const EXTENSION_ID = process.env['CEB_EXTENSION_ID'] ?? 'unknown';
export const EXTENSION_KEY = process.env['CEB_EXTENSION_KEY'] ?? 'unknown';
