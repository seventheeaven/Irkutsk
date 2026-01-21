import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMenu } from '../contexts/MenuContext';
import menuIcon from '../../img/menu_2.svg';
import logoIcon from '../../img/logo.svg';
import './Header.css';

export const Header = () => {
  const { isMenuOpen, setIsMenuOpen } = useMenu();
  const navigate = useNavigate();
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    const checkProfile = () => {
      const savedProfile = localStorage.getItem('userProfile');
      setHasProfile(!!savedProfile);
    };

    checkProfile();
    
    // Слушаем изменения в localStorage
    const handleStorageChange = () => {
      checkProfile();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Проверяем при монтировании и при изменении меню
    if (isMenuOpen) {
      checkProfile();
    }
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isMenuOpen]);

  const handleMenuClick = () => {
    setIsMenuOpen(!isMenuOpen);
    // Проверяем профиль при открытии меню
    const savedProfile = localStorage.getItem('userProfile');
    setHasProfile(!!savedProfile);
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

  const handleLogout = () => {
    // Удаляем профиль из localStorage
    localStorage.removeItem('userProfile');
    
    // Удаляем cookies
    document.cookie = 'userEmail=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'pendingEmail=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    setHasProfile(false);
    handleMenuClose();
    navigate('/my-collections');
    // Перезагружаем страницу, чтобы обновить состояние
    window.location.reload();
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
            {hasProfile && (
              <button 
                className="header__menu-item"
                onClick={handleLogout}
              >
                Выйти
              </button>
            )}
          </div>
        </>
      )}
    </>
  );
};
