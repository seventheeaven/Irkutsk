// Сервис для получения рекомендаций от ChatGPT
// Для использования нужен API ключ от OpenAI: https://platform.openai.com/api-keys
// Добавьте VITE_OPENAI_API_KEY в .env файл

// Безопасное получение переменной окружения
const OPENAI_API_KEY = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_OPENAI_API_KEY : undefined;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export interface Recommendation {
  name: string;
  description: string;
  category?: string;
  address?: string;
}

/**
 * Получить рекомендации мест в Иркутске от ChatGPT
 * @param query - поисковый запрос пользователя
 */
export const getRecommendations = async (query: string): Promise<Recommendation[]> => {
  if (!OPENAI_API_KEY) {
    console.warn('OpenAI API key not configured. Please set VITE_OPENAI_API_KEY in .env file');
    return getFallbackRecommendations(query);
  }

  try {
    const systemPrompt = `Ты помощник для городского портала Иркутска. Твоя задача - рекомендовать места в Иркутске на основе запроса пользователя.

Важно:
1. Рекомендуй только реальные места в Иркутске
2. Отвечай ТОЛЬКО в формате JSON массива объектов
3. Каждый объект должен содержать: name (название места), description (краткое описание 1-2 предложения), category (категория: кафе, ресторан, музей, парк, развлечения и т.д.), address (адрес если известен)
4. Верни 5-8 рекомендаций
5. Не добавляй никакого текста кроме JSON

Формат ответа:
[
  {
    "name": "Название места",
    "description": "Описание места",
    "category": "категория",
    "address": "адрес"
  }
]`;

    const userPrompt = `Пользователь ищет: "${query}". Рекомендуй места в Иркутске, которые подходят под этот запрос.`;

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content in response');
    }

    // Парсим JSON из ответа
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const recommendations = JSON.parse(jsonMatch[0]);
      return recommendations;
    }

    // Если не удалось распарсить, возвращаем fallback
    return getFallbackRecommendations(query);
  } catch (error) {
    console.error('Error fetching recommendations from ChatGPT:', error);
    return getFallbackRecommendations(query);
  }
};

/**
 * Fallback рекомендации (если API недоступен)
 */
const getFallbackRecommendations = (query: string): Recommendation[] => {
  // Базовые рекомендации для разных типов запросов
  const allRecommendations: Recommendation[] = [
    {
      name: 'Кафе "130 квартал"',
      description: 'Уютное кафе в историческом центре города с отличным кофе и десертами',
      category: 'кафе',
      address: 'ул. Карла Маркса, 1',
    },
    {
      name: 'Ресторан "Байкал"',
      description: 'Ресторан с видом на Ангару, специализируется на блюдах сибирской кухни',
      category: 'ресторан',
      address: 'ул. Ленина, 15',
    },
    {
      name: 'Музей истории Иркутска',
      description: 'Интересная экспозиция об истории города и региона',
      category: 'музей',
      address: 'ул. Франк-Каменецкого, 16а',
    },
    {
      name: 'Парк "Юбилейный"',
      description: 'Красивый парк для прогулок и отдыха с детьми',
      category: 'парк',
      address: 'ул. Советская',
    },
    {
      name: 'Кинотеатр "Художественный"',
      description: 'Современный кинотеатр с несколькими залами',
      category: 'развлечения',
      address: 'ул. Карла Маркса, 23',
    },
    {
      name: 'Бар "Пивной дом"',
      description: 'Атмосферное место для вечернего отдыха с большой картой напитков',
      category: 'бар',
      address: 'ул. Ленина, 38',
    },
  ];

  // Фильтруем по запросу (простая логика)
  const lowerQuery = query.toLowerCase();
  if (lowerQuery.includes('кафе') || lowerQuery.includes('кофе')) {
    return allRecommendations.filter(r => r.category === 'кафе');
  }
  if (lowerQuery.includes('ресторан') || lowerQuery.includes('поесть')) {
    return allRecommendations.filter(r => r.category === 'ресторан');
  }
  if (lowerQuery.includes('музей') || lowerQuery.includes('культура')) {
    return allRecommendations.filter(r => r.category === 'музей');
  }
  if (lowerQuery.includes('парк') || lowerQuery.includes('прогулка')) {
    return allRecommendations.filter(r => r.category === 'парк');
  }
  if (lowerQuery.includes('кино') || lowerQuery.includes('фильм')) {
    return allRecommendations.filter(r => r.category === 'развлечения');
  }

  return allRecommendations.slice(0, 6);
};





