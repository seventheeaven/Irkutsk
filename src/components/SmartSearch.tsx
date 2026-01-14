import { useState, useEffect, useRef, ChangeEvent } from 'react';
import searchIcon from '../../img/lucide_search_default.svg';
import './SmartSearch.css';

interface SmartSearchProps {
  onSearch: (query: string) => void;
  disableAnimation?: boolean;
}

const placeholderTexts = [
  'Куда пойти с подружками?',
  'Где отпраздновать День Рождения?',
  'Провести выходной с ребенком',
  'Поход на один день'
];

export const SmartSearch = ({ onSearch, disableAnimation = false }: SmartSearchProps) => {
  const [query, setQuery] = useState('');
  const [animatedPlaceholder, setAnimatedPlaceholder] = useState('');
  const currentTextIndexRef = useRef(0);
  const currentCharIndexRef = useRef(0);
  const isDeletingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (disableAnimation) {
      setAnimatedPlaceholder('Найти');
      return;
    }

    if (query) {
      setAnimatedPlaceholder('');
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      return;
    }

    const animate = () => {
      const currentText = placeholderTexts[currentTextIndexRef.current];
      
      if (!isDeletingRef.current) {
        // Печатаем новый текст
        if (currentCharIndexRef.current < currentText.length) {
          setAnimatedPlaceholder(currentText.slice(0, currentCharIndexRef.current + 1));
          currentCharIndexRef.current++;
          timeoutRef.current = setTimeout(animate, 100);
        } else {
          // Дождались конца, ждем 2 секунды, затем начинаем удалять
          timeoutRef.current = setTimeout(() => {
            isDeletingRef.current = true;
            animate();
          }, 2000);
        }
      } else {
        // Удаляем текст
        if (currentCharIndexRef.current > 0) {
          setAnimatedPlaceholder(currentText.slice(0, currentCharIndexRef.current - 1));
          currentCharIndexRef.current--;
          timeoutRef.current = setTimeout(animate, 50);
        } else {
          // Удалили всё, переходим к следующему тексту
          isDeletingRef.current = false;
          currentTextIndexRef.current = (currentTextIndexRef.current + 1) % placeholderTexts.length;
          currentCharIndexRef.current = 0;
          // Очищаем placeholder перед началом нового текста
          setAnimatedPlaceholder('');
          // Небольшая пауза перед началом нового текста
          timeoutRef.current = setTimeout(() => {
            animate();
          }, 200);
        }
      }
    };

    // Инициализация: начинаем с первого текста
    if (animatedPlaceholder === '' && currentCharIndexRef.current === 0 && !isDeletingRef.current) {
      animate();
    } else {
      animate();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query, disableAnimation]);

  // Инициализация анимации при монтировании
  useEffect(() => {
    if (disableAnimation) {
      setAnimatedPlaceholder('Найти');
      return;
    }
    if (!query) {
      const currentText = placeholderTexts[currentTextIndexRef.current];
      setAnimatedPlaceholder(currentText[0] || '');
      currentCharIndexRef.current = 1;
    }
  }, [disableAnimation]);

  useEffect(() => {
    onSearch(query);
  }, [query, onSearch]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleClear = () => {
    setQuery('');
    // Сбрасываем состояние анимации
    currentCharIndexRef.current = 0;
    isDeletingRef.current = false;
    setAnimatedPlaceholder('');
  };

  return (
    <div className="smart-search">
      <div className="smart-search__wrapper">
        <img src={searchIcon} alt="Search" className="smart-search__icon" />
        <input
          type="text"
          className="smart-search__input"
          placeholder={animatedPlaceholder}
          value={query}
          onChange={handleChange}
        />
        {query && (
          <button
            type="button"
            className="smart-search__clear"
            onClick={handleClear}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};
