const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';
const MAX_CONTEXT_MESSAGES = 6;
const MAX_COMPLETION_TOKENS = 650;

const SYSTEM_PROMPTS = {
  ru: `Ты опытный ветеринар в Кыргызстане.
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
Если информации мало — задай уточняющий вопрос.`,
  ky: `Сен Кыргызстандагы тажрыйбалуу ветеринарсың.
Фермер жаныбардын белгилерин сүрөттөйт же сүрөт жиберет.

Эгер сүрөт болсо — көрүнгөн белгилерди талда:
тери, жүн, көз, былжыр чел, жаныбардын турушу, ичтин көөп турушу.

Кыргыз тилинде жооп бер. Формат:

🔴 Мүмкүн болгон диагноз: [аталышы]
📊 Ишеним: жогору / орточо / төмөн

⚠️ АЗЫР эмне кылуу керек:
1. ...
2. ...
3. ...

💊 Эмне менен дарылоо керек: [жеткиликтүү дарылар]

🚨 Тез ветеринар чакырыңыз, эгер: [белгилер]

Так жана түшүнүктүү бол. Фермер алыскы аймакта,
ветеринарга жетүү чектелүү болушу мүмкүн.
Маалымат аз болсо — тактоочу суроо бер.`,
};

const RESPONSE_MESSAGES = {
  ru: {
    aiRequestError: 'Не удалось получить ответ от AI.',
    aiNoText: 'AI не вернул текстовый ответ.',
  },
  ky: {
    aiRequestError: 'AI жооп бере алган жок.',
    aiNoText: 'AI тексттик жооп кайтарган жок.',
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

  if (!Array.isArray(payload.messages)) {
    return jsonResponse({ error: 'messages must be an array.' }, { status: 400 });
  }

  const language = payload.language === 'ky' ? 'ky' : 'ru';

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.3,
      max_completion_tokens: MAX_COMPLETION_TOKENS,
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPTS[language],
        },
        ...payload.messages.slice(-MAX_CONTEXT_MESSAGES),
      ],
    }),
  });

  const data = await response.json();
  const messages = RESPONSE_MESSAGES[language];

  if (!response.ok) {
    return jsonResponse(
      { error: data.error?.message || messages.aiRequestError },
      { status: response.status },
    );
  }

  return jsonResponse({
    content: data.choices?.[0]?.message?.content || messages.aiNoText,
  });
}
