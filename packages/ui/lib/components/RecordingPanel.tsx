import { configStorage, recordingInitialState, recordingStorage } from '@extension/storage';
import { useStorage } from '@extension/shared';
import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/utils';
import { t } from '@extension/i18n';

type RecordingPanelProps = ComponentPropsWithoutRef<'div'>;

export const RecordingPanel = ({ className, children, ...props }: RecordingPanelProps) => {
  const config = useStorage(configStorage);
  const isLight = config.theme === 'light';
  const recording = useStorage(recordingStorage);

  return (
    <div
      className={cn(
        className,
        `flex justify-between gap-4 border rounded-lg p-2`,
        isLight ? 'border-gray-800' : 'border-slate-50',
      )}
      {...props}>
      <div className={cn('flex justify-between basis-2/5')}>
        <span>{t('items_status')}</span>
        <span>
          {Object.keys(recording.data.entity).reduce((acc, key) => {
            return acc + (recording.data.entity[key]?.length || 0);
          }, 0)}
        </span>
      </div>
      <div className={cn('flex justify-between basis-2/5')}>
        <span>{t('digging_status')}</span>
        <span>
          {recording.data.fetched.length - recording.toFetchLeft} / {recording.data.fetched.length}
        </span>
      </div>
      <div className={cn('flex justify-between basis-auto')}>
        <button
          onClick={() => recordingStorage.set(recordingInitialState)}
          className={cn('text-red-500')}
          title={t('delete_hint')}>
          {t('delete_button')}
        </button>
      </div>
      {children}
    </div>
  );
};
