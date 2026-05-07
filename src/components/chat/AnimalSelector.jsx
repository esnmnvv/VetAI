import { animals, localize } from '../../data/siteData.js';
import { useI18n } from '../../i18n/useI18n.js';
import { useChatStore } from '../../store/chatStore.js';

export default function AnimalSelector() {
  const { language, t } = useI18n();
  const selectedAnimal = useChatStore((state) => state.selectedAnimal);
  const setSelectedAnimal = useChatStore((state) => state.setSelectedAnimal);

  return (
    <>
      <div className="field-label">{t.animalLabel}</div>
      <div className="animal-select">
        {animals.map((animal) => (
          <button
            type="button"
            className={`animal-btn ${selectedAnimal === animal.value ? 'active' : ''}`}
            key={animal.value}
            onClick={() => setSelectedAnimal(animal.value)}
          >
            {localize(animal.label, language)}
          </button>
        ))}
      </div>
    </>
  );
}
