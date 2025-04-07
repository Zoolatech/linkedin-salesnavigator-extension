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

export const externalMessageSchema = z.object({
  type: z.literal('XHR'),
  data: recordedXHRSchema,
});

export type RecordedXHR = z.infer<typeof recordedXHRSchema>;
export type ExternalMessage = z.infer<typeof externalMessageSchema>;
