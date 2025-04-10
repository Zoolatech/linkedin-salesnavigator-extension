import { configStorage } from '@extension/storage';
import { useStorage } from '@extension/shared';
import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/utils';
import { t } from '@extension/i18n';

type SettingsPanelProps = ComponentPropsWithoutRef<'div'>;

export const SettingsPanel = ({ className, children, ...props }: SettingsPanelProps) => {
  const config = useStorage(configStorage);
  const isLight = config.theme === 'light';

  return (
    <div
      className={cn(className, 'flex gap-2 border rounded-lg p-2', isLight ? 'border-gray-800' : 'border-slate-50 ')}
      {...props}>
      <button onClick={configStorage.toggleRecording} className={cn('flex-1')}>
        {t('recording_button')}{' '}
        <code>{config.recording ? t('recordingRecording_message') : t('recordingIdle_message')}</code>
      </button>
      <button onClick={configStorage.toggleDigging} className={cn('flex-1')}>
        {t('digging_button')} <code>{config.digging ? t('settingOn_message') : t('settingOff_message')}</code>
      </button>
      <button onClick={configStorage.toggleLogging} className={cn('flex-1')}>
        {t('logging_button')} <code>{config.logging ? t('settingOn_message') : t('settingOff_message')}</code>
      </button>
      <button onClick={configStorage.toggleTheme} className={cn('flex-1')}>
        {t('theme_button')} <code>{isLight ? t('themeLight_message') : t('themeDark_message')}</code>
      </button>
      {children}
    </div>
  );
};
