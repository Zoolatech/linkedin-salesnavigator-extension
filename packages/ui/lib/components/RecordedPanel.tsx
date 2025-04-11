import { configStorage, recordingStorage } from '@extension/storage';
import { parserModelLinkedin, selectAllBrowseItems, useStorage } from '@extension/shared';
import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/utils';
import { t } from '@extension/i18n';

type RecordedPanelProps = ComponentPropsWithoutRef<'div'>;

export const RecordedPanel = ({ className, children, ...props }: RecordedPanelProps) => {
  const config = useStorage(configStorage);
  const isLight = config.theme === 'light';
  const recording = useStorage(recordingStorage);
  const browseItems = selectAllBrowseItems(parserModelLinkedin.entities, recording.data.entity);

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
          {Object.keys(recording.data.entity).map(key => (
            <li key={key}>
              {key}: {recording.data.entity[key]?.length || 0}
              <ul className={cn('list-disc ml-4')}>
                {Array.from(browseItems.get(key)?.entries() || [])
                  .filter(([, values]) => values.length > 0)
                  .map(([fieldName, values]) => (
                    <li key={fieldName}>
                      <button
                        className={cn('px-2 py-1 flex items-center gap-1 border-b border-dashed hover:bg-slate-500')}
                        onClick={() => console.log(`Field: ${fieldName}, Values:`, values)}>
                        {fieldName} ({values.length}) <span>{t('link_button')}</span>
                      </button>
                    </li>
                  ))}
                <li className={cn('flex gap-2 mt-2')}>
                  <button
                    className={cn('hover:bg-slate-500')}
                    onClick={() => console.log('Download CSV')}
                    title="Download CSV">
                    <span>{t('csv_button')}</span>
                  </button>
                  <button
                    className={cn('hover:bg-slate-500')}
                    onClick={() => console.log('Copy to Clipboard')}
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

    // <div
    //   className={cn(
    //     className,
    //     `flex justify-between gap-4 border rounded-lg p-2`,
    //     isLight ? 'border-gray-800' : 'border-slate-50 ',
    //   )}
    //   {...props}>
    //   <div className={cn('flex justify-between basis-2/5')}>
    //     <span>{t('items_status')}</span>
    //     <span>
    //       {Object.keys(recording.data.entity).reduce((acc, key) => {
    //         return acc + (recording.data.entity[key]?.length || 0);
    //       }, 0)}
    //     </span>
    //   </div>
    //   <div className={cn('flex justify-between basis-2/5')}>
    //     <span>{t('digging_status')}</span>
    //     <span>
    //       {recording.data.fetched.length - recording.toFetchLeft} / {recording.data.fetched.length}
    //     </span>
    //   </div>
    //   <div className={cn('flex justify-between basis-auto')}>
    //     <button
    //       onClick={() => recordingStorage.set(recordingInitialState)}
    //       className={cn('text-red-500')}
    //       title={t('delete_hint')}>
    //       {t('delete_button')}
    //     </button>
    //   </div>
    //   {children}
    // </div>
  );
};
