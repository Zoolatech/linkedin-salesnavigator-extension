import { configStorage, recordingStorage } from '@extension/storage';
import {
  createTabularForm,
  parserModelLinkedin,
  selectAllBrowseItems,
  tableToCSV,
  tableToTabular,
  useStorage,
} from '@extension/shared';
import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/utils';
import { t } from '@extension/i18n';

type RecordedPanelProps = ComponentPropsWithoutRef<'div'>;

async function openUrls(urls: string[]): Promise<void> {
  const newWindow = await chrome.windows.create({ focused: true, setSelfAsOpener: true });
  urls.forEach((url, index) => {
    setTimeout(async () => {
      try {
        await chrome.tabs.create({ windowId: newWindow.id, url });
      } catch (error) {
        console.error(error);
      }
    }, index * 1000);
  });
}

export const RecordedPanel = ({ className, children, ...props }: RecordedPanelProps) => {
  const config = useStorage(configStorage);
  const isLight = config.theme === 'light';
  const recording = useStorage(recordingStorage);
  const browseItems = selectAllBrowseItems(parserModelLinkedin.entities, recording.entity);

  function downloadCSV(entityName: string): void {
    const table = createTabularForm(
      parserModelLinkedin.entities[entityName]?.fields,
      recording.entity[entityName] || [],
    );
    const csv = tableToCSV(table);
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    chrome.downloads.download({ url, filename: `${entityName}.csv` });
  }

  function copyToClipboard(entityName: string): void {
    const table = createTabularForm(
      parserModelLinkedin.entities[entityName]?.fields,
      recording.entity[entityName] || [],
    );
    const tabular = tableToTabular(table);
    navigator.clipboard.writeText(tabular);
  }

  return (
    <div
      className={cn(
        className,
        'flex justify-between gap-4 border rounded-lg p-2 text-sm',
        isLight ? 'border-gray-800' : 'border-slate-50',
      )}
      {...props}>
      <div className={cn('flex flex-col basis-full')}>
        <div className={cn('font-medium text-center')}>{t('recorded_label')}</div>
        <ul>
          {Object.keys(recording.entity).map(key => (
            <li key={key}>
              {key}: {recording.entity[key]?.length || 0}
              <ul className={cn('list-disc ml-4')}>
                {Array.from(browseItems.get(key)?.entries() || [])
                  .filter(([, values]) => values.length > 0)
                  .map(([fieldName, values]) => (
                    <li key={fieldName}>
                      <button
                        className={cn('px-2 py-1 flex items-center gap-1 border-b border-dashed hover:bg-slate-500')}
                        onClick={() => openUrls(values)}>
                        {fieldName} ({values.length}) <span>{t('link_button')}</span>
                      </button>
                    </li>
                  ))}
                <li className={cn('flex gap-2 mt-2')}>
                  <button className={cn('hover:bg-slate-500')} onClick={() => downloadCSV(key)} title="Download CSV">
                    <span>{t('csv_button')}</span>
                  </button>
                  <button
                    className={cn('hover:bg-slate-500')}
                    onClick={() => copyToClipboard(key)}
                    title="Copy to Clipboard">
                    <span>{t('clipboard_button')}</span>
                  </button>
                </li>
              </ul>
            </li>
          ))}
        </ul>
      </div>
      {children}
    </div>
  );
};
