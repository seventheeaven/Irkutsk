import { Header } from '../components/Header';
import { SmartSearch } from '../components/SmartSearch';
import { Categories } from '../components/Categories';
import constructionImage from '../../img/construction.png';
import './HomePage.css';

export const HomePage = () => {
  return (
    <div className="home-page">
      <div className="home-page__bottom-layer">
        <Header />
        <SmartSearch onSearch={() => {}} />
        <Categories />
      </div>
      <div className="home-page__coming-soon">
        <img 
          src={constructionImage} 
          alt="Строительные работы" 
          className="home-page__coming-soon-image"
        />
        <p className="home-page__coming-soon-text">
          Скоро здесь будет лента с постами!
          <br /><br />
          Верю в вас и в то, что вы будете делиться своими любимыми местами в&nbsp;любимом городе (я точно буду их сохранять!)
        </p>
      </div>
    </div>
  );
};
