import type { ZodType, ZodTypeDef } from 'zod';
import { createStorage } from './base.js';
import type { BaseStorage, StorageConfig } from './types.js';
import deepEqual from 'deep-equal';

export function createStorageChecked<D = string, Def extends ZodTypeDef = ZodTypeDef, I = D>(
  key: string,
  schema: ZodType<D, Def, I>,
  fallback: D,
  config?: StorageConfig<D>,
): BaseStorage<D> {
  const theirConfig: StorageConfig<D> = config ?? {};
  const theirSerial = theirConfig.serialization ?? {
    serialize: (v: D): string => v as string,
    deserialize: (v: string): D => v as D,
  };
  const deserializeChecked = (v: string): D => {
    const notChecked = theirSerial.deserialize(v);
    const parsed = schema.safeParse(notChecked);
    if (parsed.success) {
      const checked = parsed.data;
      const equal = deepEqual(notChecked, checked, { strict: true });
      if (!equal) console.warn('Fixed storage:', notChecked, checked);
      return equal ? notChecked : checked;
    }
    console.warn('Fixed storage:', notChecked, fallback);
    return fallback;
  };

  return createStorage(key, fallback, {
    ...theirConfig,
    serialization: { ...theirSerial, deserialize: deserializeChecked },
  });
}
