import '@src/Popup.css';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { configStorage } from '@extension/storage';
import { t } from '@extension/i18n';

const Popup = () => {
  const config = useStorage(configStorage);
  const isLight = config.theme === 'light';
  const logo = isLight ? 'popup/Zoolatech_Icon.svg' : 'popup/Zoolatech_Icon_Light.svg';
  const bgColor = isLight ? 'bg-slate-50' : 'bg-gray-800';
  const fgColor = isLight ? 'text-gray-900' : 'text-gray-100';

  return (
    <div className={`App ${bgColor}`}>
      <header className={`App-header ${fgColor} flex gap-2 mb-3`}>
        <img src={chrome.runtime.getURL(logo)} className="App-logo" width="20px" alt="Zoolatech" />
        <div>Sales Navigator Helper</div>
      </header>
      <div className={`${bgColor} ${fgColor} flex flex-row flex-wrap gap-2 `}>
        <button onClick={configStorage.toggleRecording} className="flex-1">
          {t('recording_button')}{' '}
          <code>{config.recording ? t('recordingRecording_message') : t('recordingIdle_message')}</code>
        </button>
        <button onClick={configStorage.toggleDigging} className="flex-1">
          {t('digging_button')} <code>{config.digging ? t('settingOn_message') : t('settingOff_message')}</code>
        </button>
        <button onClick={configStorage.toggleLogging} className="flex-1">
          {t('logging_button')} <code>{config.logging ? t('settingOn_message') : t('settingOff_message')}</code>
        </button>
        <button onClick={configStorage.toggleTheme} className="flex-1">
          {t('theme_button')} <code>{isLight ? t('themeLight_message') : t('themeDark_message')}</code>
        </button>
      </div>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div> Loading ... </div>), <div> Error Occur </div>);
