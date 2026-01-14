import { Place } from '../types';

export const mockPlaces: Place[] = [
  {
    id: '1',
    name: 'Кафе "Кофе & Книги"',
    description: 'Уютное кафе с большой библиотекой и отличным кофе. Идеальное место для работы и отдыха.',
    category: 'кафе',
    address: 'ул. Карла Маркса, 15',
    rating: 4.5,
    priceLevel: '₽₽',
    workingHours: 'Пн-Вс: 9:00 - 22:00',
    phone: '+7 (3952) 123-456'
  },
  {
    id: '2',
    name: 'Иркутский областной художественный музей',
    description: 'Крупнейший художественный музей Восточной Сибири с богатой коллекцией русского и западноевропейского искусства.',
    category: 'музеи',
    address: 'ул. Ленина, 5',
    rating: 4.7,
    priceLevel: '₽₽',
    workingHours: 'Вт-Вс: 10:00 - 18:00',
    phone: '+7 (3952) 334-256'
  },
  {
    id: '3',
    name: 'Парк имени Парижской Коммуны',
    description: 'Центральный парк города с красивыми аллеями, детскими площадками и фонтанами.',
    category: 'парки',
    address: 'ул. Карла Маркса',
    rating: 4.6,
    priceLevel: '₽',
    workingHours: 'Круглосуточно'
  },
  {
    id: '4',
    name: 'Ресторан "Pro Торговые ряды"',
    description: 'Современный ресторан с европейской кухней и панорамным видом на город.',
    category: 'рестораны',
    address: 'ул. Урицкого, 8',
    rating: 4.4,
    priceLevel: '₽₽₽',
    workingHours: 'Вс-Чт: 12:00 - 24:00, Пт-Сб: 12:00 - 02:00',
    phone: '+7 (3952) 555-123'
  },
  {
    id: '5',
    name: 'Кинотеатр "Художественный"',
    description: 'Современный многозальный кинотеатр в центре города с комфортными залами.',
    category: 'кино',
    address: 'ул. Карла Маркса, 20',
    rating: 4.3,
    priceLevel: '₽₽',
    workingHours: 'Ежедневно: 10:00 - 02:00',
    phone: '+7 (3952) 200-300'
  },
  {
    id: '6',
    name: 'Боулинг-клуб "Шар"',
    description: 'Развлекательный центр с боулингом, бильярдом и баром.',
    category: 'развлечения',
    address: 'ул. Декабрьских Событий, 102',
    rating: 4.2,
    priceLevel: '₽₽',
    workingHours: 'Пн-Чт: 14:00 - 01:00, Пт-Вс: 12:00 - 03:00',
    phone: '+7 (3952) 444-555'
  },
  {
    id: '7',
    name: 'Кафе "Эдельвейс"',
    description: 'Уютное семейное кафе с домашней кухней и теплой атмосферой.',
    category: 'кафе',
    address: 'ул. Грязнова, 2',
    rating: 4.6,
    priceLevel: '₽₽',
    workingHours: 'Пн-Вс: 10:00 - 23:00',
    phone: '+7 (3952) 234-567'
  },
  {
    id: '8',
    name: 'Театр драмы им. Н.П. Охлопкова',
    description: 'Один из старейших театров Сибири с богатым репертуаром и историей.',
    category: 'театры',
    address: 'ул. Карла Маркса, 14',
    rating: 4.8,
    priceLevel: '₽₽',
    workingHours: 'Касса: 10:00 - 20:00',
    phone: '+7 (3952) 200-567'
  },
  {
    id: '9',
    name: 'Спорт-бар "Атмосфера"',
    description: 'Современный спорт-бар с трансляциями и хорошей кухней.',
    category: 'бары',
    address: 'ул. Свердлова, 28',
    rating: 4.3,
    priceLevel: '₽₽',
    workingHours: 'Пн-Вс: 16:00 - 02:00',
    phone: '+7 (3952) 333-444'
  },
  {
    id: '10',
    name: 'Ледовый дворец "Байкал-Арена"',
    description: 'Современный спортивный комплекс для катания на коньках и хоккея.',
    category: 'спорт',
    address: 'ул. Байкальская, 267',
    rating: 4.5,
    priceLevel: '₽₽',
    workingHours: 'Пн-Вс: 10:00 - 22:00',
    phone: '+7 (3952) 777-888'
  },
  {
    id: '11',
    name: 'Квест-рум "Мозгобойня"',
    description: 'Интеллектуальные квесты и игры для компаний.',
    category: 'развлечения',
    address: 'ул. Ленина, 38',
    rating: 4.4,
    priceLevel: '₽₽',
    workingHours: 'Пн-Вс: 12:00 - 24:00',
    phone: '+7 (3952) 555-666'
  },
  {
    id: '12',
    name: 'Пиццерия "Додо Пицца"',
    description: 'Сеть пиццерий с быстрой доставкой и вкусной пиццей.',
    category: 'рестораны',
    address: 'ул. Литвинова, 16',
    rating: 4.2,
    priceLevel: '₽₽',
    workingHours: 'Пн-Вс: 10:00 - 23:00',
    phone: '+7 (3952) 888-999'
  }
];

// Функция для получения рекомендаций (топ по рейтингу)
export const getRecommendedPlaces = (places: Place[], count: number = 3): Place[] => {
  return [...places]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, count);
};

// Функция для поиска мест по запросу (простой поиск, можно заменить на ИИ)
export const searchPlaces = (places: Place[], query: string): Place[] => {
  const lowerQuery = query.toLowerCase();
  return places.filter(place => 
    place.name.toLowerCase().includes(lowerQuery) ||
    place.description.toLowerCase().includes(lowerQuery) ||
    place.category.toLowerCase().includes(lowerQuery) ||
    place.address.toLowerCase().includes(lowerQuery)
  );
};
