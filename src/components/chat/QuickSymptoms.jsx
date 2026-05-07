import { localize, quickSymptoms } from '../../data/siteData.js';
import { useI18n } from '../../i18n/useI18n.js';
import { useChatStore } from '../../store/chatStore.js';

export default function QuickSymptoms() {
  const { language, t } = useI18n();
  const addSymptom = useChatStore((state) => state.addSymptom);

  return (
    <>
      <div className="field-label">{t.quickSymptomsLabel}</div>
      <div className="quick-symptoms">
        {quickSymptoms.map((symptom) => (
          <button type="button" className="qs-btn" key={symptom.ru} onClick={() => addSymptom(localize(symptom, language))}>
            {localize(symptom, language)}
          </button>
        ))}
      </div>
    </>
  );
}
