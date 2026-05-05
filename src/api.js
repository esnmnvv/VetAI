const API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';
const MAX_IMAGE_SIDE = 1280;
const IMAGE_QUALITY = 0.82;

export const SYSTEM_PROMPT = `Ты опытный ветеринар в Кыргызстане.
Фермер описывает симптомы или присылает фото своего животного.

Если есть фото — проанализируй визуальные признаки:
состояние кожи, шерсти, глаз, слизистых, позу животного, вздутие.

Отвечай на русском языке в формате:

🔴 Вероятный диагноз: [название]
📊 Уверенность: высокая / средняя / низкая

⚠️ Что делать СЕЙЧАС:
1. ...
2. ...
3. ...

💊 Чем лечить: [доступные препараты]

🚨 Срочно к ветеринару если: [признаки]

Будь конкретным. Фермер в отдалённом районе,
доступ к ветеринару ограничен.
Если информации мало — задай уточняющий вопрос.`;

export async function askGroq(messages) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  if (!apiKey) {
    throw new Error('Добавьте VITE_GROQ_API_KEY в .env файл.');
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.3,
      max_completion_tokens: 1000,
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        ...messages,
      ],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Не удалось получить ответ от AI.');
  }

  return data.choices?.[0]?.message?.content || 'AI не вернул текстовый ответ.';
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
