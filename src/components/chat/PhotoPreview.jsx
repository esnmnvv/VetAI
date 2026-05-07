import { useI18n } from '../../i18n/useI18n.js';
import { useChatStore } from '../../store/chatStore.js';

export default function PhotoPreview() {
  const { t } = useI18n();
  const photo = useChatStore((state) => state.photo);
  const photoPreview = useChatStore((state) => state.photoPreview);
  const clearPhoto = useChatStore((state) => state.clearPhoto);

  if (!photoPreview) return null;

  return (
    <div className="photo-preview">
      <img src={photoPreview} alt={t.previewAlt} />
      <div>
        <div className="photo-name">{photo?.name}</div>
        <div className="photo-help">{t.photoHelp}</div>
      </div>
      <button type="button" className="photo-remove" onClick={clearPhoto}>
        {t.remove}
      </button>
    </div>
  );
}
