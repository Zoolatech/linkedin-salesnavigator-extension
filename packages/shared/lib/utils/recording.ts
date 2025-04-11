import type { EntityTraits, FieldTraits, ParserConfig, RecordedData, ValueRecord } from '@extension/shared-types';

export type ColumnValues = Map<string, string[]>;
type CVEntry = [string, string[]];
export type EntityColumnValues = Map<string, ColumnValues>;
type ECVEntry = [string, ColumnValues];

function selectColumn(field: string, records: ValueRecord[]): string[] {
  return records
    .map(r => r[field])
    .filter(r => r !== undefined)
    .map(r => (typeof r === 'object' ? r.value : r))
    .filter(r => r !== undefined);
}

function selectBrowseItems(fields: EntityTraits['fields'], records?: ValueRecord[]): ColumnValues {
  return new Map(
    fields === undefined || records === undefined || records.length === 0
      ? []
      : Object.entries(fields || {})
          .filter((arr): arr is [string, FieldTraits] => typeof arr[1] === 'object')
          .filter(([, type]) => type.browse)
          .map(([field, type]) => [type.displayName || field, selectColumn(field, records)] satisfies CVEntry)
          .filter(([, records]) => records.length > 0),
  );
}

export function selectAllBrowseItems(
  entities: ParserConfig['entities'],
  recorded: RecordedData['entity'],
): EntityColumnValues {
  return new Map(
    Object.entries(entities)
      .map(([entity, type]) => [entity, selectBrowseItems(type.fields, recorded[entity])] satisfies ECVEntry)
      .filter(([, items]) => items.size > 0),
  );
}
