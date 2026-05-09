const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';

const TARGET_LANGUAGE_LABEL = {
  ru: 'русский язык',
  ky: 'кыргызский язык',
};

const RESPONSE_MESSAGES = {
  ru: {
    translateError: 'Не удалось перевести сохраненный чат.',
  },
  ky: {
    translateError: 'Сакталган чатты которуу мүмкүн болгон жок.',
  },
};

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

  const language = payload.language === 'ky' ? 'ky' : 'ru';
  const messages = Array.isArray(payload.messages) ? payload.messages.slice(0, 12) : [];
  const responseMessages = RESPONSE_MESSAGES[language];

  if (!messages.every((message) => typeof message === 'string')) {
    return jsonResponse({ error: 'messages must be an array of strings.' }, { status: 400 });
  }

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `Переведи каждый элемент строго на ${TARGET_LANGUAGE_LABEL[language]}. Не используй английский язык. Сохрани ветеринарный смысл, переносы строк, нумерацию и markdown-подобное форматирование. Верни только валидный JSON в формате: {"translations":["..."]}.`,
        },
        {
          role: 'user',
          content: JSON.stringify({ messages }),
        },
      ],
    }),
  });

  const rawBody = await response.text();
  let data = {};

  try {
    data = rawBody ? JSON.parse(rawBody) : {};
  } catch {
    data = {};
  }

  if (!response.ok) {
    return jsonResponse(
      { error: data.error?.message || responseMessages.translateError },
      { status: response.status },
    );
  }

  let parsedContent = {};
  try {
    parsedContent = JSON.parse(data.choices?.[0]?.message?.content || '{}');
  } catch {
    parsedContent = {};
  }

  const translations = Array.isArray(parsedContent.translations)
    ? parsedContent.translations.map((item) => String(item))
    : [];

  return jsonResponse({
    translations: translations.length === messages.length ? translations : messages,
  });
}
