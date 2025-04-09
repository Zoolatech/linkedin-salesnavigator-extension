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
          {t('Recording:')} <code>{config.recording ? t('Recording...') : t('Idle...')}</code>
        </button>
        <button onClick={configStorage.toggleDigging} className="flex-1">
          {t('Digging:')} <code>{config.digging ? t('On') : t('Off')}</code>
        </button>
        <button onClick={configStorage.toggleLogging} className="flex-1">
          {t('Logging:')} <code>{config.logging ? t('On') : t('Off')}</code>
        </button>
        <button onClick={configStorage.toggleTheme} className="flex-1">
          {t('Theme:')} <code>{isLight ? t('light') : t('dark')}</code>
        </button>
      </div>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div> Loading ... </div>), <div> Error Occur </div>);
