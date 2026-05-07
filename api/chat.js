const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';

const SYSTEM_PROMPT = `Ты опытный ветеринар в Кыргызстане.
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

export const config = {
  runtime: 'edge',
};

const jsonResponse = (body, init = {}) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });

export default async function handler(request) {
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, { status: 405 });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return jsonResponse({ error: 'GROQ_API_KEY is not configured on the server.' }, { status: 500 });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (!Array.isArray(payload.messages)) {
    return jsonResponse({ error: 'messages must be an array.' }, { status: 400 });
  }

  const response = await fetch(GROQ_API_URL, {
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
        ...payload.messages,
      ],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    return jsonResponse(
      { error: data.error?.message || 'Не удалось получить ответ от AI.' },
      { status: response.status },
    );
  }

  return jsonResponse({
    content: data.choices?.[0]?.message?.content || 'AI не вернул текстовый ответ.',
  });
}
