const MAX_IMAGE_SIDE = 1280;
const IMAGE_QUALITY = 0.82;

export async function askGroq(messages) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Не удалось получить ответ от AI.');
  }

  return data.content || 'AI не вернул текстовый ответ.';
}

export function imageFileToDataUrl(file) {
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
        reject(new Error('Не удалось подготовить фото для анализа.'));
        return;
      }

      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', IMAGE_QUALITY));
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Не удалось прочитать фото. Попробуйте другой JPEG/PNG файл.'));
    };

    image.src = objectUrl;
  });
}
