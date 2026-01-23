import './Categories.css';
import bakeryImage from '../../img/bakery.png';

const categoryLabels = [
  'Для вечерней встречи',
  'Места для свиданий',
  'Для внутренней культуры',
  'культурный отдых'
];

const cardColors = [
  '#F8E0BE',
  '#FFDBF9',
  '#DBE6FF',
  '#F8E0BE'
];

const cardHeights = [240, 186, 186, 240];

export const Categories = () => {
  return (
    <section className="categories">
      <div className="categories__header">
        <h2 className="categories__title">Подборки</h2>
        <button className="categories__view-all">смотреть все</button>
      </div>
      <div className="categories__grid">
        {categoryLabels.map((label, index) => {
          // Позиционирование:
          // index 0 (первая) -> колонка 1, строка 1
          // index 1 (вторая) -> колонка 2, строка 1
          // index 2 (третья) -> колонка 1, строка 2
          // index 3 (четвертая) -> колонка 2, строка 2
          const gridColumn = index % 2 === 0 ? 1 : 2;
          const gridRow = index < 2 ? 1 : 2;
          
          return (
            <div 
              key={index} 
              className={`categories__card-item ${index === 1 ? 'categories__card-item--compact' : ''}`}
              style={{
                gridColumn: gridColumn,
                gridRow: gridRow
              }}
            >
              <div 
                className="categories__card"
                style={{ 
                  background: cardColors[index],
                  height: `${cardHeights[index]}px`
                }}
              >
                {index === 0 && (
                  <img 
                    src={bakeryImage} 
                    alt="" 
                    className="categories__card-image"
                  />
                )}
              </div>
              <span className="categories__card-text">{label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
};

