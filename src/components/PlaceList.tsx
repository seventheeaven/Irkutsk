import { Place, Category } from '../types';
import { PlaceCard } from './PlaceCard';
import './PlaceList.css';

interface PlaceListProps {
  places: Place[];
  selectedCategory?: Category;
}

export const PlaceList = ({ places, selectedCategory }: PlaceListProps) => {
  const filteredPlaces = selectedCategory
    ? places.filter(place => place.category === selectedCategory)
    : places;

  if (filteredPlaces.length === 0) {
    return (
      <div className="place-list__empty">
        <p>Места не найдены{selectedCategory ? ` в категории "${selectedCategory}"` : ''}</p>
      </div>
    );
  }

  return (
    <div className="place-list">
      {filteredPlaces.map(place => (
        <PlaceCard key={place.id} place={place} />
      ))}
    </div>
  );
};






