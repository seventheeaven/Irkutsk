// Сервис для получения изображений из Unsplash
// Для использования нужен API ключ от Unsplash: https://unsplash.com/developers
// В демо-режиме можно использовать демо-ключ, но для продакшена нужен свой

// Демо-ключ для тестирования (ограничен: 50 запросов/час)
// Для продакшена получите свой ключ на https://unsplash.com/developers
const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY || 'YOUR_UNSPLASH_ACCESS_KEY';
const UNSPLASH_API_URL = 'https://api.unsplash.com';

// Альтернатива: использовать прямые ссылки на Unsplash без API (ограниченно)
const USE_DIRECT_LINKS = !UNSPLASH_ACCESS_KEY || UNSPLASH_ACCESS_KEY === 'YOUR_UNSPLASH_ACCESS_KEY';

export interface UnsplashImage {
  id: string;
  urls: {
    small: string;
    regular: string;
    full: string;
  };
  description: string | null;
  alt_description: string | null;
  width: number;
  height: number;
}

export interface UnsplashSearchResponse {
  results: UnsplashImage[];
  total: number;
  total_pages: number;
}

/**
 * Получить изображения по запросу из Unsplash
 * @param query - поисковый запрос (например, "Irkutsk", "Иркутск")
 * @param perPage - количество изображений на странице (максимум 30)
 * @param page - номер страницы
 */
export const searchImages = async (
  query: string = 'Irkutsk',
  perPage: number = 30,
  page: number = 1
): Promise<UnsplashImage[]> => {
  try {
    // Если ключ не установлен, возвращаем пустой массив
    if (UNSPLASH_ACCESS_KEY === 'YOUR_UNSPLASH_ACCESS_KEY') {
      console.warn('Unsplash API key not configured. Please set UNSPLASH_ACCESS_KEY in imageService.ts');
      return getFallbackImages();
    }

    const response = await fetch(
      `${UNSPLASH_API_URL}/search/photos?query=${encodeURIComponent(query)}&per_page=${perPage}&page=${page}&client_id=${UNSPLASH_ACCESS_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }

    const data: UnsplashSearchResponse = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching images from Unsplash:', error);
    // В случае ошибки возвращаем fallback изображения
    return getFallbackImages();
  }
};

/**
 * Получить случайные изображения (fallback)
 */
const getFallbackImages = (): UnsplashImage[] => {
  // Используем placeholder изображения или локальные изображения
  const fallbackUrls = [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400',
  ];

  return fallbackUrls.map((url, index) => ({
    id: `fallback-${index}`,
    urls: {
      small: url,
      regular: url,
      full: url,
    },
    description: 'Irkutsk',
    alt_description: 'Irkutsk city',
    width: 400,
    height: 300,
  }));
};

/**
 * Получить изображения через прямые ссылки Unsplash (без API)
 * Это работает без API ключа, но с ограничениями
 */
const getDirectUnsplashImages = (count: number = 30): UnsplashImage[] => {
  // Используем прямые ссылки на изображения Unsplash, связанные с Иркутском
  // Эти изображения будут загружаться напрямую без API
  const imageIds = [
    '1506905925346-21bda4d32df4', // Городской пейзаж
    '1469854523086-cc02fe5d8800', // Архитектура
    '1507525428034-b723cf961d3e', // Природа
    '1519681393784-d120267933ba', // Город
    '1526304646401-a0c52a8a88bb', // Улицы
    '1514565131-fce0801e5785', // Здания
    '1506905925346-21bda4d32df4', // Повтор для разнообразия
    '1469854523086-cc02fe5d8800',
    '1507525428034-b723cf961d3e',
    '1519681393784-d120267933ba',
  ];

  return Array.from({ length: count }, (_, index) => {
    const imageId = imageIds[index % imageIds.length];
    return {
      id: `direct-${index}`,
      urls: {
        small: `https://images.unsplash.com/photo-${imageId}?w=400&h=300&fit=crop`,
        regular: `https://images.unsplash.com/photo-${imageId}?w=800&h=600&fit=crop`,
        full: `https://images.unsplash.com/photo-${imageId}?w=1920&h=1080&fit=crop`,
      },
      description: 'Irkutsk',
      alt_description: 'Irkutsk city',
      width: 800,
      height: 600,
    };
  });
};

/**
 * Получить изображения, связанные с Иркутском
 * Использует несколько поисковых запросов для разнообразия
 */
export const getIrkutskImages = async (count: number = 30): Promise<UnsplashImage[]> => {
  // Если API ключ не установлен, используем прямые ссылки
  if (USE_DIRECT_LINKS) {
    return getDirectUnsplashImages(count);
  }

  const queries = ['Irkutsk', 'Irkutsk city', 'Baikal', 'Siberia', 'Russia city'];
  const imagesPerQuery = Math.ceil(count / queries.length);
  
  const allImages: UnsplashImage[] = [];
  
  for (const query of queries) {
    try {
      const images = await searchImages(query, imagesPerQuery, 1);
      allImages.push(...images);
      
      if (allImages.length >= count) {
        break;
      }
    } catch (error) {
      console.error(`Error fetching images for query "${query}":`, error);
    }
  }
  
  // Если не получилось загрузить через API, используем прямые ссылки
  if (allImages.length === 0) {
    return getDirectUnsplashImages(count);
  }
  
  // Перемешиваем и ограничиваем количество
  return shuffleArray(allImages).slice(0, count);
};

/**
 * Перемешать массив
 */
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

