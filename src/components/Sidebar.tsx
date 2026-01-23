import { Link, useLocation } from 'react-router-dom';
import { useMemo, useCallback } from 'react';
import { useMenu } from '../contexts/MenuContext';
import homeIcon from '../../img/hugeicons_home-12.svg';
import homeIconActive from '../../img/hugeicons_home-12_active.svg';
import searchIcon from '../../img/lucide_search_default.svg';
import searchIconActive from '../../img/lucide_search_active.svg';
import heartIcon from '../../img/si_heart-line.svg';
import heartIconActive from '../../img/si_heart-line_active.svg';
import './Sidebar.css';

interface SidebarProps {
  isVisible?: boolean;
}

export const Sidebar = ({ isVisible = true }: SidebarProps) => {
  const { isMenuOpen } = useMenu();
  const location = useLocation();

  const currentPath = useMemo(() => location.pathname, [location.pathname]);

  const isActive = useCallback((path: string) => currentPath === path, [currentPath]);

  const handleClick = useCallback(() => {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) (navigator as { vibrate?: (n: number) => boolean }).vibrate?.(10);
    } catch (_) { /* vibrate не поддерживается на iOS */ }
  }, []);

  const isHomeActive = useMemo(() => isActive('/'), [isActive]);
  const isRecommendationsActive = useMemo(() => isActive('/recommendations'), [isActive]);
  const isCollectionsActive = useMemo(() => isActive('/my-collections'), [isActive]);

  return (
    <nav className={`sidebar ${!isVisible || isMenuOpen ? 'sidebar--hidden' : ''}`}>
      <Link 
        to="/" 
        className={`sidebar__item ${isHomeActive ? 'sidebar__item--active' : ''}`}
        onClick={handleClick}
      >
        <div className="sidebar__icon-wrapper">
          <img 
            src={homeIcon} 
            alt="Главная" 
            className="sidebar__icon sidebar__icon--default" 
          />
          <img 
            src={homeIconActive} 
            alt="Главная" 
            className="sidebar__icon sidebar__icon--active" 
          />
        </div>
      </Link>
      <Link 
        to="/recommendations" 
        className={`sidebar__item ${isRecommendationsActive ? 'sidebar__item--active' : ''}`}
        onClick={handleClick}
      >
        <div className="sidebar__icon-wrapper">
          <img 
            src={searchIcon} 
            alt="Рекомендации" 
            className="sidebar__icon sidebar__icon--default" 
          />
          <img 
            src={searchIconActive} 
            alt="Рекомендации" 
            className="sidebar__icon sidebar__icon--active" 
          />
        </div>
      </Link>
      <Link 
        to="/my-collections" 
        className={`sidebar__item ${isCollectionsActive ? 'sidebar__item--active' : ''}`}
        onClick={handleClick}
      >
        <div className="sidebar__icon-wrapper">
          <img 
            src={heartIcon} 
            alt="Мои подборки" 
            className="sidebar__icon sidebar__icon--default" 
          />
          <img 
            src={heartIconActive} 
            alt="Мои подборки" 
            className="sidebar__icon sidebar__icon--active" 
          />
        </div>
      </Link>
    </nav>
  );
};
