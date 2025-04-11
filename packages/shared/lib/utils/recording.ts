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

export type HeaderCell = {
  fieldName: string;
  displayName: string;
};

export type TabularForm = {
  header: HeaderCell[];
  rows: string[][];
};

type ValueRecordValue = ValueRecord[keyof ValueRecord];
function toValue(value?: ValueRecordValue): string | undefined {
  return typeof value === 'object' ? value.value : value;
}

function createHeader(fields: EntityTraits['fields'], recorded: ValueRecord[]): TabularForm['header'] {
  const fieldsMap = new Map(
    fields === undefined
      ? []
      : Object.entries(fields).map(([fieldName, maybeTraits]) => [
          fieldName,
          typeof maybeTraits === 'object' ? maybeTraits.displayName || fieldName : maybeTraits,
        ]),
  );
  recorded.forEach(record => {
    Object.entries(record).forEach(([fieldName, value]) => {
      if (toValue(value) !== undefined && !fieldsMap.has(fieldName)) {
        fieldsMap.set(fieldName, fieldName);
      }
    });
  });
  return Array.from(fieldsMap.entries()).map(([fieldName, displayName]) => ({ fieldName, displayName }));
}

export function createTabularForm(fields: EntityTraits['fields'], recorded: ValueRecord[]): TabularForm {
  const header: TabularForm['header'] = createHeader(fields, recorded);
  const rows: string[][] = recorded.map(record => header.map(cell => toValue(record[cell.fieldName]) || ''));
  return { header, rows };
}

function escapeCSVValue(value: string): string {
  return `"${`${value}`.replace(/"/g, '""')}"`;
}

function escapeTabularValue(value: string): string {
  return `${value}`.replace(/\t/g, '\\t').replace(/\r/g, '\\r').replace(/\n/g, '\\n');
}

export function tableToCSV(table: TabularForm): string {
  const rows = [table.header.map(h => h.displayName)];
  rows.push(...table.rows);
  return rows.map(r => r.map(c => escapeCSVValue(c)).join(',')).join('\r\n');
}

export function tableToTabular(table: TabularForm): string {
  const rows = [table.header.map(h => h.displayName)];
  rows.push(...table.rows);
  return rows.map(r => r.map(c => escapeTabularValue(c)).join('\t')).join('\r\n');
}
