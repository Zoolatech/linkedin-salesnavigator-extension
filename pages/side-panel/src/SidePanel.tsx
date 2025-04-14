import '@src/SidePanel.css';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { configStorage } from '@extension/storage';
import { RecordingPanel, SettingsPanel, RecordedPanel } from '@extension/ui';

const SidePanel = () => {
  const config = useStorage(configStorage);
  const isLight = config.theme === 'light';
  const logo = isLight ? 'side-panel/Zoolatech_FullLogo.svg' : 'side-panel/Zoolatech_FullLogo_Light.svg';

  return (
    <div className={`App ${isLight ? 'bg-slate-50 text-gray-900' : 'bg-gray-800 text-gray-100'}`}>
      <header className="App-header flex gap-2 mb-2 text-lg font-medium">
        <img src={chrome.runtime.getURL(logo)} className="App-logo" width="100px" alt="Zoolatech" />
        <div>Sales Navigator Helper</div>
      </header>
      <SettingsPanel className="App-settings mb-3" />
      <RecordingPanel className="App-recording mb-3" />
      <RecordedPanel className="App-recorded mb-3" />
    </div>
  );
};

export default withErrorBoundary(withSuspense(SidePanel, <div> Loading ... </div>), <div> Error Occur </div>);
