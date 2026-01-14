import { mockPlaces } from '../data/places';
import './Feed.css';

export const Feed = () => {
  // Используем места из mockPlaces для ленты
  const feedItems = [...mockPlaces, ...mockPlaces.slice(0, 6)];

  return (
    <div className="feed">
      <div className="feed__content">
        {feedItems.map((place, index) => (
          <div key={`${place.id}-${index}`} className="feed__item">
            <div className="feed__item-image"></div>
            <div className="feed__item-content">
              <h3 className="feed__item-title">{place.name}</h3>
              <p className="feed__item-description">{place.description}</p>
              <div className="feed__item-meta">
                <span className="feed__item-category">{place.category}</span>
                <span className="feed__item-rating">⭐ {place.rating}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
