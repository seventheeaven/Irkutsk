import { useState, useEffect, useCallback } from 'react';
import { Header } from '../components/Header';
import { SmartSearch } from '../components/SmartSearch';
import { useMenu } from '../contexts/MenuContext';
import { mockPlaces } from '../data/places';
import { getIrkutskImages, UnsplashImage } from '../services/imageService';
import { getRecommendations, Recommendation } from '../services/chatGPTService';
import heartIcon from '../../img/si_heart-line.svg';
import heartIconActive from '../../img/si_heart-line_active.svg';
import './RecommendationsPage.css';

interface LikedItem {
  id: string;
  imageUrl: string;
  description: string;
  title?: string;
  address?: string;
}

export const RecommendationsPage = () => {
  const { isMenuOpen } = useMenu();
  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  
  // Создаем больше карточек для эффекта Pinterest
  const allPlaces = [...mockPlaces, ...mockPlaces, ...mockPlaces];

  // Загружаем лайки из localStorage
  useEffect(() => {
    const savedLikes = localStorage.getItem('likedItems');
    if (savedLikes) {
      try {
        const likedIds = JSON.parse(savedLikes);
        setLikedItems(new Set(likedIds));
      } catch (error) {
        console.error('Error loading likes:', error);
      }
    }
  }, []);
  
  useEffect(() => {
    const loadImages = async () => {
      setLoading(true);
      try {
        const irkutskImages = await getIrkutskImages(allPlaces.length);
        setImages(irkutskImages);
      } catch (error) {
        console.error('Error loading images:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadImages();
  }, []);

  // Обработка поискового запроса с дебаунсом
  useEffect(() => {
    if (!searchQuery.trim()) {
      setRecommendations([]);
      setSearchError(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setSearchLoading(true);
      setSearchError(null);
      
      try {
        const recs = await getRecommendations(searchQuery);
        setRecommendations(recs);
        
        // Загружаем изображения для рекомендаций
        if (recs.length > 0) {
          const recImages = await getIrkutskImages(recs.length);
          setImages(recImages);
        }
      } catch (error) {
        console.error('Error getting recommendations:', error);
        setSearchError('Не удалось получить рекомендации. Попробуйте еще раз.');
      } finally {
        setSearchLoading(false);
      }
    }, 800); // Задержка 800ms

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleLikeClick = useCallback((itemId: string, imageUrl: string, description: string, title?: string, address?: string) => {
    const newLikedItems = new Set(likedItems);
    
    if (newLikedItems.has(itemId)) {
      // Удаляем из лайков
      newLikedItems.delete(itemId);
      const savedLikes = localStorage.getItem('likedItems');
      if (savedLikes) {
        try {
          const likedIds: string[] = JSON.parse(savedLikes);
          const updatedLikes = likedIds.filter(id => id !== itemId);
          localStorage.setItem('likedItems', JSON.stringify(updatedLikes));
          
          // Удаляем из детальной информации
          const savedLikedItems = localStorage.getItem('likedItemsDetails');
          if (savedLikedItems) {
            const likedItemsDetails: LikedItem[] = JSON.parse(savedLikedItems);
            const updatedDetails = likedItemsDetails.filter(item => item.id !== itemId);
            localStorage.setItem('likedItemsDetails', JSON.stringify(updatedDetails));
          }
        } catch (error) {
          console.error('Error removing like:', error);
        }
      }
    } else {
      // Добавляем в лайки
      newLikedItems.add(itemId);
      const savedLikes = localStorage.getItem('likedItems');
      const likedIds: string[] = savedLikes ? JSON.parse(savedLikes) : [];
      likedIds.push(itemId);
      localStorage.setItem('likedItems', JSON.stringify(likedIds));
      
      // Сохраняем детальную информацию
      const savedLikedItems = localStorage.getItem('likedItemsDetails');
      const likedItemsDetails: LikedItem[] = savedLikedItems ? JSON.parse(savedLikedItems) : [];
      likedItemsDetails.push({
        id: itemId,
        imageUrl,
        description,
        title,
        address
      });
      localStorage.setItem('likedItemsDetails', JSON.stringify(likedItemsDetails));
    }
    
    setLikedItems(newLikedItems);
  }, [likedItems]);
  
  // Генерируем случайные высоты для эффекта Pinterest
  const getRandomHeight = (index: number) => {
    const heights = [180, 220, 250, 200, 280, 190, 240, 210];
    return heights[index % heights.length];
  };

  // Определяем, что показывать
  const showRecommendations = searchQuery.trim().length > 0;
  const displayItems = showRecommendations ? recommendations : allPlaces;

  return (
    <div className="recommendations-page">
      <div className="recommendations-page__bottom-layer">
        <Header />
      </div>
      <div className="recommendations-page__header">
        <h1 className="recommendations-page__title">Рекомендации</h1>
      </div>
      <div className="recommendations-page__search">
        <SmartSearch onSearch={handleSearch} disableAnimation={true} />
      </div>
      
      {searchLoading && (
        <div className="recommendations-page__loading">
          Ищу рекомендации...
        </div>
      )}
      
      {searchError && (
        <div className="recommendations-page__error">
          {searchError}
        </div>
      )}
      
      {!searchLoading && !searchError && (
        <>
          {showRecommendations && recommendations.length === 0 && searchQuery.trim().length > 0 && (
            <div className="recommendations-page__empty">
              К сожалению, ничего не найдено. Попробуйте изменить запрос.
            </div>
          )}
          
          {loading && !showRecommendations ? (
            <div className="recommendations-page__loading">Загрузка изображений...</div>
          ) : (
            <div className="recommendations-page__grid">
              {displayItems.map((item, index) => {
                const image = images[index] || images[index % images.length];
                const imageUrl = image?.urls?.regular || image?.urls?.small || '';
                const description = showRecommendations 
                  ? (item as Recommendation).description 
                  : (item as typeof mockPlaces[0]).description;
                const title = showRecommendations 
                  ? (item as Recommendation).name 
                  : (item as typeof mockPlaces[0]).name;
                const itemId = showRecommendations 
                  ? `rec-${index}` 
                  : `${(item as typeof mockPlaces[0]).id}-${index}`;
                const isLiked = likedItems.has(itemId);
                const address = showRecommendations && (item as Recommendation).address 
                  ? (item as Recommendation).address 
                  : undefined;
                
                return (
                  <div 
                    key={itemId} 
                    className="recommendations-page__card"
                    onDoubleClick={() => {
                      if (!isLiked) {
                        handleLikeClick(itemId, imageUrl, description, title, address);
                      }
                    }}
                  >
                    {imageUrl ? (
                      <img 
                        src={imageUrl}
                        alt={image?.alt_description || description}
                        className="recommendations-page__image"
                        style={{ height: `${getRandomHeight(index)}px` }}
                        loading="lazy"
                      />
                    ) : (
                      <div 
                        className="recommendations-page__image"
                        style={{ height: `${getRandomHeight(index)}px` }}
                      ></div>
                    )}
                    <img 
                      src={isLiked ? heartIconActive : heartIcon} 
                      alt="Like" 
                      className={`recommendations-page__card-heart ${isLiked ? 'recommendations-page__card-heart--active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLikeClick(itemId, imageUrl, description, title, address);
                      }}
                    />
                    <div className="recommendations-page__card-content">
                      {showRecommendations && (
                        <h3 className="recommendations-page__card-title">{title}</h3>
                      )}
                      <p className="recommendations-page__card-description">{description}</p>
                      {showRecommendations && address && (
                        <p className="recommendations-page__card-address">
                          📍 {address}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

