import { useChatStore } from '../../store/chatStore.js';

export default function PhotoPreview() {
  const photo = useChatStore((state) => state.photo);
  const photoPreview = useChatStore((state) => state.photoPreview);
  const clearPhoto = useChatStore((state) => state.clearPhoto);

  if (!photoPreview) return null;

  return (
    <div className="photo-preview">
      <img src={photoPreview} alt="Превью фото" />
      <div>
        <div className="photo-name">{photo?.name}</div>
        <div className="photo-help">Фото отправится вместе с сообщением</div>
      </div>
      <button type="button" className="photo-remove" onClick={clearPhoto}>
        Убрать
      </button>
    </div>
  );
}
