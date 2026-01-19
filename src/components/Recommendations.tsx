import { Place } from '../types';
import './Recommendations.css';

interface RecommendationsProps {
  places: Place[];
}

const categoryLabels = [
  'красиво покушать',
  'спокойный день',
  'активный досуг',
  'культурный отдых',
  'для детей',
  'романтический вечер',
  'весело провести время',
  'тихое место',
  'с друзьями',
  'для всей семьи',
  'развлечения',
  'на свежем воздухе'
];

export const Recommendations = ({ places }: RecommendationsProps) => {
  if (places.length === 0) {
    return null;
  }

  return (
    <section className="recommendations">
      <h2 className="recommendations__title">Подборки</h2>
      <div className="recommendations__grid">
        {places.map((place, index) => (
          <div key={place.id} className="recommendations__card">
            <h3 className="recommendations__card-title">{categoryLabels[index % categoryLabels.length]}</h3>
          </div>
        ))}
      </div>
    </section>
  );
};
