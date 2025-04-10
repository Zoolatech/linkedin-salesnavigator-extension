import { z } from 'zod';

export type ValueOf<T> = T[keyof T];

export const recordedXHRSchema = z.object({
  method: z.string().optional(),
  url: z.union([z.string(), z.instanceof(URL)]).optional(),
  requestHeaders: z.record(z.string()).optional(),
  requestBody: z.any().optional(),
  responseHeaders: z.string().nullable().optional(),
  responseObject: z.any(),
});

export const fetchProgressSchema = z.object({
  left: z.number(),
});

export const recordedXHRMessageSchema = z.object({
  type: z.literal('XHR'),
  data: recordedXHRSchema,
});

export const fetchProgressMessageSchema = z.object({
  type: z.literal('FETCH_PROGRESS'),
  data: fetchProgressSchema,
});

export const externalMessageSchema = z.union([recordedXHRMessageSchema, fetchProgressMessageSchema]);

export type RecordedXHR = z.infer<typeof recordedXHRSchema>;
export type FetchProgress = z.infer<typeof fetchProgressSchema>;
export type ExternalMessage = z.infer<typeof externalMessageSchema>;

export type FieldTraits = {
  entityRef?: string;
  displayName?: string;
  type?: 'string' | 'url' | 'image';
  fetch?: boolean;
  browse?: boolean;
};

export type EntityTraits = {
  displayName?: string;
  fields?: Record<string, string | FieldTraits>;
  fieldID?: string;
};

export const valueRecordSchema = z.record(
  z.union([z.string(), z.object({ value: z.string(), altValue: z.string() })]).optional(),
);

export type ValueRecord = z.infer<typeof valueRecordSchema>;
export type ValuesExtractor = (data: RecordedXHR) => ValueRecord[];
export type EntityParser = {
  entity: string;
  urlMatcher: RegExp;
  extractor?: ValuesExtractor;
};

export type ParserConfig = {
  entities: Record<string, EntityTraits>;
  parsers: EntityParser[];
};

export const recordedDataSchema = z.object({
  entity: z.record(z.array(valueRecordSchema)).default({}),
  fetched: z.array(z.string()).default([]),
});
export type RecordedData = z.infer<typeof recordedDataSchema>;
