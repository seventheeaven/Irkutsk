import { Place } from '../types';
import './PlaceCard.css';

interface PlaceCardProps {
  place: Place;
}

export const PlaceCard = ({ place }: PlaceCardProps) => {
  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'кафе': 'Кафе',
      'рестораны': 'Ресторан',
      'бары': 'Бар',
      'музеи': 'Музей',
      'театры': 'Театр',
      'кино': 'Кинотеатр',
      'парки': 'Парк',
      'развлечения': 'Развлечения',
      'спорт': 'Спорт',
      'другое': 'Другое'
    };
    return labels[category] || category;
  };

  return (
    <article className="place-card">
      <div className="place-card__header">
        <h2 className="place-card__name">{place.name}</h2>
        {place.rating && (
          <div className="place-card__rating">
            <span className="place-card__rating-value">★ {place.rating}</span>
          </div>
        )}
      </div>
      
      <div className="place-card__category">
        {getCategoryLabel(place.category)}
      </div>
      
      <p className="place-card__description">{place.description}</p>
      
      <div className="place-card__info">
        <div className="place-card__address">
          <span className="place-card__icon">📍</span>
          <span>{place.address}</span>
        </div>
        
        {place.workingHours && (
          <div className="place-card__hours">
            <span className="place-card__icon">🕐</span>
            <span>{place.workingHours}</span>
          </div>
        )}
        
        {place.priceLevel && (
          <div className="place-card__price">
            <span className="place-card__price-level">{place.priceLevel}</span>
          </div>
        )}
      </div>
      
      {(place.phone || place.website) && (
        <div className="place-card__contacts">
          {place.phone && (
            <a href={`tel:${place.phone}`} className="place-card__contact-link">
              {place.phone}
            </a>
          )}
          {place.website && (
            <a href={place.website} target="_blank" rel="noopener noreferrer" className="place-card__contact-link">
              Сайт
            </a>
          )}
        </div>
      )}
    </article>
  );
};




