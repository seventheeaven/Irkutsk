import { useNavigate } from 'react-router-dom';
import { useMenu } from '../contexts/MenuContext';
import menuIcon from '../../img/menu_2.svg';
import logoIcon from '../../img/logo.svg';
import './Header.css';

export const Header = () => {
  const { isMenuOpen, setIsMenuOpen } = useMenu();
  const navigate = useNavigate();

  const handleMenuClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  const handleSettingsClick = () => {
    navigate('/settings');
    handleMenuClose();
  };

  const handleContactClick = () => {
    window.open('https://t.me/raaisondetre', '_blank');
    handleMenuClose();
  };

  return (
    <>
      <header className="header">
        <img src={logoIcon} alt="Иркутск" className="header__logo" />
        <img 
          src={menuIcon} 
          alt="Меню" 
          className="header__menu" 
          onClick={handleMenuClick}
        />
      </header>
      {isMenuOpen && (
        <>
          <div className="header__menu-overlay" onClick={handleMenuClose}></div>
          <div className="header__menu-dropdown">
            <button 
              className="header__menu-item"
              onClick={handleSettingsClick}
            >
              Настройки
            </button>
            <button 
              className="header__menu-item"
              onClick={handleContactClick}
            >
              Связаться с нами
            </button>
          </div>
        </>
      )}
    </>
  );
};
