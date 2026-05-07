import { getTranslation } from './i18n/translations.js';

const MAX_IMAGE_SIDE = 1280;
const IMAGE_QUALITY = 0.82;

export async function askGroq(messages, language = 'ru') {
  const t = getTranslation(language);
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      language,
      messages,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || t.aiRequestError);
  }

  return data.content || t.aiNoText;
}

export function imageFileToDataUrl(file, language = 'ru') {
  const t = getTranslation(language);

  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(image.width, image.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));

      const context = canvas.getContext('2d');
      if (!context) {
        reject(new Error(t.imagePrepareError));
        return;
      }

      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', IMAGE_QUALITY));
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(t.imageReadError));
    };

    image.src = objectUrl;
  });
}
