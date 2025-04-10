import type {
  EntityParser,
  EntityTraits,
  ValueRecord,
  RecordedXHR,
  ParserConfig,
  FieldTraits,
  RecordedData,
} from '@extension/shared-types';
import { type Config } from '@extension/storage';

export function processXHR(
  model: ParserConfig,
  data: RecordedXHR,
  recorder: RecordedData,
  config?: Config | null,
): string[] {
  if (config?.logging) console.log('Processing XHR:', data);
  const toFetch: string[] = [];

  let gotSome = false;

  model.parsers
    .filter(parser => parser.urlMatcher.test(data.url?.toString() || ''))
    .map(parser => ({
      parsedEntity: parser.entity,
      parsedFields: extractFields(data, parser.extractor, model.entities[parser.entity]?.fields),
    }))
    .filter(({ parsedFields }) => parsedFields.length > 0)
    .forEach(({ parsedEntity, parsedFields }) => {
      const maybeEntityTraits = model.entities[parsedEntity];
      const entityTraits: EntityTraits =
        typeof maybeEntityTraits === 'object' ? maybeEntityTraits : { fieldID: undefined };
      const fieldID = entityTraits.fieldID;
      parsedFields.forEach(parsedRecord => {
        const parsedRecordId = fieldID !== undefined ? parsedRecord[fieldID] : undefined;
        let recordedEntity =
          fieldID !== undefined && parsedRecordId !== undefined && recorder.entity[parsedEntity] !== undefined
            ? recorder.entity[parsedEntity].find(recorded => recorded[fieldID] === parsedRecordId)
            : undefined;

        for (const [parsedField, parsedValue] of Object.entries(parsedRecord)) {
          if (parsedValue === undefined) {
            if (config?.logging) console.warn(`Value for ${parsedField} is undefined:`, parsedRecord);
            continue;
          }

          gotSome = true;

          const recordedEntities = (recorder.entity[parsedEntity] = recorder.entity[parsedEntity] || []);
          if (recordedEntity === undefined) {
            recordedEntity = {};
            recordedEntities.push(recordedEntity);
          }

          recordedEntity[parsedField] = parsedValue;

          const maybeFieldTraits = entityTraits.fields?.[parsedField];
          const fieldTraits: FieldTraits = typeof maybeFieldTraits === 'object' ? maybeFieldTraits : { fetch: false };
          const mainValue = typeof parsedValue === 'object' ? parsedValue.value : parsedValue;
          if (
            mainValue !== undefined &&
            fieldTraits.fetch &&
            recorder.fetched.indexOf(mainValue) === -1 &&
            toFetch.indexOf(mainValue) === -1
          ) {
            toFetch.push(mainValue);
          }
        }
      });
    });

  if (gotSome && config?.logging) {
    console.log('Recorded:', recorder);
    console.log('To fetch:', toFetch);
  }

  return toFetch;
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
