import { quickSymptoms } from '../../data/siteData.js';
import { useChatStore } from '../../store/chatStore.js';

export default function QuickSymptoms() {
  const addSymptom = useChatStore((state) => state.addSymptom);

  return (
    <>
      <div className="field-label">Быстрые симптомы:</div>
      <div className="quick-symptoms">
        {quickSymptoms.map((symptom) => (
          <button type="button" className="qs-btn" key={symptom} onClick={() => addSymptom(symptom)}>
            {symptom}
          </button>
        ))}
      </div>
    </>
  );
}
