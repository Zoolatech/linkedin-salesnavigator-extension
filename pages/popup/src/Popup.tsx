import '@src/Popup.css';
import { parserModelLinkedin, useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { configStorage, recordingStorage } from '@extension/storage';
import { t } from '@extension/i18n';
import { RecordingPanel, SettingsPanel } from '@extension/ui';
import type { ValueRecord } from '@extension/shared-types';

type BrowseItemsByDisplayName = Map<string, string[]>;
type EntityBrowseItems = Map<string, BrowseItemsByDisplayName>;

const Popup = () => {
  const config = useStorage(configStorage);
  const recording = useStorage(recordingStorage);
  const isLight = config.theme === 'light';
  const logo = isLight ? 'popup/Zoolatech_Icon.svg' : 'popup/Zoolatech_Icon_Light.svg';

  const browseItems: EntityBrowseItems = new Map();
  Object.entries(parserModelLinkedin.entities).forEach(([entityName, entityTraits]) => {
    Object.entries(entityTraits.fields || {})
      .filter(
        ([fieldName, fieldTraits]) => typeof fieldTraits === 'object' && fieldTraits.browse && fieldName !== undefined,
      )
      .forEach(([fieldName, fieldTraits]) => {
        const fieldSlotName = typeof fieldTraits === 'object' ? fieldTraits.displayName || fieldName : fieldName;
        recording.data.entity[entityName]
          ?.filter(
            (item: ValueRecord) =>
              item[fieldName] !== undefined &&
              (typeof item[fieldName] !== 'object' || item[fieldName].value !== undefined),
          )
          .forEach((item: ValueRecord) => {
            const fieldValue = item[fieldName];
            const mainValue = typeof fieldValue === 'object' ? fieldValue.value : fieldValue;
            let entitySlot = browseItems.get(entityName);
            if (entitySlot === undefined) {
              entitySlot = new Map();
              browseItems.set(entityName, entitySlot);
            }
            let fieldSlot = entitySlot.get(fieldSlotName);
            if (fieldSlot === undefined) {
              fieldSlot = [];
              entitySlot.set(fieldSlotName, fieldSlot);
            }
            fieldSlot.push(mainValue!);
          });
      });
  });

  return (
    <div className={`App ${isLight ? 'bg-slate-50 text-gray-900' : 'bg-gray-800 text-gray-100'}`}>
      <header className="App-header flex gap-2 mb-2 text-lg font-medium">
        <img src={chrome.runtime.getURL(logo)} className="App-logo" width="20px" alt="Zoolatech" />
        <div>Sales Navigator Helper</div>
      </header>
      <SettingsPanel className="App-settings mb-3" />
      <RecordingPanel className="App-recording mb-3" />
      <div
        className={`App-stats flex justify-between gap-4 border rounded-lg p-2 text-sm ${isLight ? 'border-gray-800' : 'border-slate-50 '}`}>
        <div className="flex flex-col basis-full">
          <div className="font-medium text-center">{t('recorded_label')}</div>
          <ul>
            {Object.keys(recording.data.entity).map(key => (
              <li key={key}>
                {key}: {recording.data.entity[key]?.length || 0}
                <ul className="list-disc ml-4">
                  {Array.from(browseItems.get(key)?.entries() || [])
                    .filter(([, values]) => values.length > 0)
                    .map(([fieldName, values]) => (
                      <li key={fieldName}>
                        <button
                          className="px-2 py-1 flex items-center gap-1 border-b border-dashed hover:bg-slate-500"
                          onClick={() => console.log(`Field: ${fieldName}, Values:`, values)}>
                          {fieldName} ({values.length}) <span>🔗</span>
                        </button>
                      </li>
                    ))}
                  <li className="flex gap-2 mt-2">
                    <button
                      className="hover:bg-slate-500"
                      onClick={() => console.log('Download CSV')}
                      title="Download CSV">
                      📥
                    </button>
                    <button
                      className="hover:bg-slate-500"
                      onClick={() => console.log('Copy to Clipboard')}
                      title="Copy to Clipboard">
                      📋
                    </button>
                  </li>
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </div>
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
