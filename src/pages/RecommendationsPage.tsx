import { useState, useEffect, useCallback } from 'react';
import { Header } from '../components/Header';
import { SmartSearch } from '../components/SmartSearch';
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

interface Publication {
  id: string;
  name: string;
  imageUrls: string[];
  itemCount: number;
  userId?: string;
  authorName?: string;
  authorUsername?: string;
  createdAt?: number;
  description?: string;
}

export const RecommendationsPage = () => {
  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [publications, setPublications] = useState<Publication[]>([]);
  
  // Создаем больше карточек для эффекта Pinterest
  const allPlaces = [...mockPlaces, ...mockPlaces, ...mockPlaces];

  // Загружаем все публикации всех пользователей из KV
  useEffect(() => {
    const loadPublications = async () => {
      try {
        const resp = await fetch('/api/publications/list');
        const data = await resp.json();
        if (resp.ok && data.publications) {
          // Публикации уже отсортированы на сервере
          setPublications(data.publications);
        }
      } catch (error) {
        console.error('Error loading publications:', error);
        // Fallback на localStorage для обратной совместимости
        const allPublications = localStorage.getItem('allPublications');
        if (allPublications) {
          try {
            const pubs: Publication[] = JSON.parse(allPublications);
            pubs.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            setPublications(pubs);
          } catch (e) {
            console.error('Error loading from localStorage:', e);
          }
        }
      }
    };
    
    loadPublications();
  }, []);

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
        // Загружаем изображения только для мест (не для публикаций, у них уже есть изображения)
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
  

  // Определяем, что показывать
  const showRecommendations = searchQuery.trim().length > 0;
  
  // Объединяем публикации с местами (публикации показываем первыми)
  const displayItems = showRecommendations 
    ? recommendations 
    : [...publications.map(pub => ({
        id: `pub-${pub.id}`,
        name: pub.name,
        description: pub.name,
        category: 'публикация' as const,
        address: '',
        image: pub.imageUrls[0],
        authorName: pub.authorName,
        authorUsername: pub.authorUsername,
      })), ...allPlaces];

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
                let imageUrl = '';
                let description = '';
                let title = '';
                let itemId = '';
                let address: string | undefined = undefined;
                
                if (showRecommendations) {
                  const rec = item as Recommendation;
                  const image = images[index] || images[index % images.length];
                  imageUrl = image?.urls?.regular || image?.urls?.small || '';
                  description = rec.description;
                  title = rec.name;
                  itemId = `rec-${index}`;
                  address = rec.address;
                } else {
                  // Проверяем, является ли элемент публикацией (первые элементы - публикации)
                  const isPublication = index < publications.length;
                  
                  if (isPublication) {
                    const pub = publications[index];
                    imageUrl = pub.imageUrls?.[0] || '';
                    description = pub.description || pub.name;
                    title = pub.name;
                    itemId = `pub-${pub.id}`;
                  } else {
                    // Это место из allPlaces
                    const placeIndex = index - publications.length;
                    const place = allPlaces[placeIndex];
                    if (place) {
                      const image = images[placeIndex] || images[placeIndex % images.length];
                      imageUrl = image?.urls?.regular || image?.urls?.small || '';
                      description = place.description;
                      title = place.name;
                      itemId = `${place.id}-${placeIndex}`;
                    }
                  }
                }
                
                const isLiked = likedItems.has(itemId);
                
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
                        alt={description}
                        className="recommendations-page__image"
                        loading="lazy"
                      />
                    ) : (
                      <div className="recommendations-page__image"></div>
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

