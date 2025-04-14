import { z } from 'zod';

export type ValueOf<T> = T[keyof T];

const xhrRequestSchema = z.object({
  method: z.string().optional(),
  url: z.string().optional(),
  requestHeaders: z.record(z.string()).optional(),
  requestBody: z.any().optional(),
});

export type XHRRequest = z.infer<typeof xhrRequestSchema>;

const xhrResponseHeaderSchema = xhrRequestSchema.extend({
  responseHeaders: z.string().nullable().optional(),
  responseStatus: z.number(),
});

export type XHRResponseHeader = z.infer<typeof xhrResponseHeaderSchema>;

export const recordedXHRSchema = xhrResponseHeaderSchema.extend({
  responseObject: z.any(),
});

export const recordedXHRMessageSchema = z.object({
  type: z.literal('XHR'),
  data: recordedXHRSchema,
});

export const workerMessageSchema = z.object({
  type: z.literal('WORKER'),
});

export const externalMessageSchema = z.discriminatedUnion('type', [recordedXHRMessageSchema, workerMessageSchema]);

export type RecordedXHR = z.infer<typeof recordedXHRSchema>;
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
  z.union([z.string(), z.object({ value: z.string().optional(), altValue: z.string().optional() })]).optional(),
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

const fetcherSchema = z.object({
  done: z.array(z.string()).default([]),
  error: z.array(xhrResponseHeaderSchema).default([]),
  progress: z.array(xhrRequestSchema).default([]),
});

export type Fetcher = z.infer<typeof fetcherSchema>;

export const recordedDataSchema = z.object({
  entity: z.record(z.array(valueRecordSchema)).default({}),
  fetcher: fetcherSchema.default({}),
});
export type RecordedData = z.infer<typeof recordedDataSchema>;
