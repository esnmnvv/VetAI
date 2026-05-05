import { animals } from '../../data/siteData.js';
import { useChatStore } from '../../store/chatStore.js';

export default function AnimalSelector() {
  const selectedAnimal = useChatStore((state) => state.selectedAnimal);
  const setSelectedAnimal = useChatStore((state) => state.setSelectedAnimal);

  return (
    <>
      <div className="field-label">Животное:</div>
      <div className="animal-select">
        {animals.map((animal) => (
          <button
            type="button"
            className={`animal-btn ${selectedAnimal === animal.value ? 'active' : ''}`}
            key={animal.value}
            onClick={() => setSelectedAnimal(animal.value)}
          >
            {animal.label}
          </button>
        ))}
      </div>
    </>
  );
}
