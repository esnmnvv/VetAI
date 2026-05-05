const API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.1-8b-instant';

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
      max_tokens: 1000,
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
