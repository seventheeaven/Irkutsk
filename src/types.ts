export interface Place {
  id: string;
  name: string;
  description: string;
  category: Category;
  address: string;
  image?: string;
  rating?: number;
  priceLevel?: PriceLevel;
  workingHours?: string;
  phone?: string;
  website?: string;
}

export type Category = 
  | 'кафе'
  | 'рестораны'
  | 'бары'
  | 'музеи'
  | 'театры'
  | 'кино'
  | 'парки'
  | 'развлечения'
  | 'спорт'
  | 'другое';

export type PriceLevel = '₽' | '₽₽' | '₽₽₽';



