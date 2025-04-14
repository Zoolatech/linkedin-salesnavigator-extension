import '@src/Popup.css';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { configStorage } from '@extension/storage';
import { RecordingPanel, SettingsPanel, RecordedPanel } from '@extension/ui';

const Popup = () => {
  const config = useStorage(configStorage);
  const isLight = config.theme === 'light';
  const logo = isLight ? 'popup/Zoolatech_Icon.svg' : 'popup/Zoolatech_Icon_Light.svg';
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const className =
    'basis-2/5 basis-auto basis-full border border-b border-dashed border-gray-800 border-slate-50 flex flex-1 flex-col font-medium gap-1 gap-2 gap-4 hover:bg-slate-500 items-center justify-between list-disc ml-4 mt-2 p-2 px-2 py-1 rounded-lg text-center text-red-500 text-sm';

  return (
    <div className={`App ${isLight ? 'bg-slate-50 text-gray-900' : 'bg-gray-800 text-gray-100'}`}>
      <header className="App-header flex gap-2 mb-2 text-lg font-medium">
        <img src={chrome.runtime.getURL(logo)} className="App-logo" width="20px" alt="Zoolatech" />
        <div>Sales Navigator Helper</div>
      </header>
      <SettingsPanel className="App-settings mb-3" />
      <RecordingPanel className="App-recording mb-3" />
      <RecordedPanel className="App-recorded mb-3" />
      <div>
        <button
          className={`w-full mt-4 py-2 ${isLight ? ' bg-slate-200 rounded hover:bg-slate-500' : ' bg-slate-500 rounded hover:bg-slate-600 '}`}
          onClick={() => chrome.runtime.sendMessage({ action: 'open_side_panel' })}>
          Open side panel
        </button>
      </div>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div> Loading ... </div>), <div> Error Occur </div>);
