import type { EntityParser, EntityTraits, ValueRecord, RecordedXHR, ParserConfig } from '@extension/shared';

export function processXHR(model: ParserConfig, data: RecordedXHR) {
  console.log('Got XHR data:', data);
  model.parsers.forEach(parser => {
    if (parser.urlMatcher.test(data.url?.toString() || '')) {
      console.log('Matched parser:', parser.entity);
      try {
        const entity = model.entities[parser.entity];
        const fields = extractFields(data, parser.extractor, entity?.fields);
        console.log('Fields:', fields);
      } catch (error) {
        console.error('Error applying template:', error);
      }
    }
  });
}

function extractFields(
  data: RecordedXHR,
  extractor: EntityParser['extractor'],
  fields: EntityTraits['fields'],
): ValueRecord[] {
  if (extractor !== undefined) {
    return extractor(data);
  }

  if (data.responseObject === undefined || fields === undefined) {
    return [];
  }

  const record: ValueRecord = {};
  for (const field of Object.keys(fields)) {
    const value = data.responseObject[field];
    if (value !== undefined) {
      record[field] = value;
    }
  }
  return [record];
}
