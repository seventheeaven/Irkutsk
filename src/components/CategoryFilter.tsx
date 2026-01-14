import { Category } from '../types';
import './CategoryFilter.css';

interface CategoryFilterProps {
  selectedCategory?: Category;
  onCategoryChange: (category?: Category) => void;
}

const categories: Category[] = ['кафе', 'рестораны', 'бары', 'музеи', 'театры', 'кино', 'парки', 'развлечения', 'спорт', 'другое'];

const categoryLabels: Record<Category, string> = {
  'кафе': 'Кафе',
  'рестораны': 'Рестораны',
  'бары': 'Бары',
  'музеи': 'Музеи',
  'театры': 'Театры',
  'кино': 'Кино',
  'парки': 'Парки',
  'развлечения': 'Развлечения',
  'спорт': 'Спорт',
  'другое': 'Другое'
};

const categoryEmojis: Record<Category, string> = {
  'кафе': '☕',
  'рестораны': '🍽️',
  'бары': '🍸',
  'музеи': '🏛️',
  'театры': '🎭',
  'кино': '🎬',
  'парки': '🌳',
  'развлечения': '🎪',
  'спорт': '⚽',
  'другое': '📍'
};

export const CategoryFilter = ({ selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  return (
    <div className="category-filter">
      <div className="category-filter__scroll">
        <button
          className={`category-filter__item ${!selectedCategory ? 'category-filter__item--active' : ''}`}
          onClick={() => onCategoryChange(undefined)}
        >
          <span className="category-filter__item-emoji">✨</span>
          <span className="category-filter__item-label">Все</span>
        </button>
        {categories.map(category => (
          <button
            key={category}
            className={`category-filter__item ${selectedCategory === category ? 'category-filter__item--active' : ''}`}
            onClick={() => onCategoryChange(category)}
          >
            <span className="category-filter__item-emoji">{categoryEmojis[category]}</span>
            <span className="category-filter__item-label">{categoryLabels[category]}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
