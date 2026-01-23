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
    // Проверяем доступность localStorage и window
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }

    const checkProfile = () => {
      try {
        const savedProfile = localStorage.getItem('userProfile');
        setHasProfile(!!savedProfile);
      } catch (e) {
        console.error('Error accessing localStorage:', e);
        setHasProfile(false);
      }
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
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange);
      }
    };
  }, [isMenuOpen]);

  const handleMenuClick = () => {
    setIsMenuOpen(!isMenuOpen);
    // Проверяем профиль при открытии меню
    if (typeof localStorage !== 'undefined') {
      try {
        const savedProfile = localStorage.getItem('userProfile');
        setHasProfile(!!savedProfile);
      } catch (e) {
        console.error('Error accessing localStorage:', e);
        setHasProfile(false);
      }
    }
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  const handleSettingsClick = () => {
    navigate('/settings');
    handleMenuClose();
  };

  const handleContactClick = () => {
    if (typeof window !== 'undefined') {
      window.open('https://t.me/raaisondetre', '_blank');
    }
    handleMenuClose();
  };

  const handleLogout = () => {
    // Закрываем меню
    handleMenuClose();
    
    // Проверяем доступность API
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }
    
    try {
      // Устанавливаем флаг выхода в sessionStorage
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('loggedOut', 'true');
      }
      
      // Удаляем профиль из localStorage
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('userProfile');
      }
      
      // Удаляем cookies (используем все возможные варианты для надежности)
      const cookiesToDelete = ['userEmail', 'pendingEmail'];
      cookiesToDelete.forEach(cookieName => {
        // Удаляем для текущего пути
        document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        // Удаляем для корневого пути
        if (window.location && window.location.hostname) {
          document.cookie = `${cookieName}=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        }
        // Удаляем без указания домена
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      });
    } catch (e) {
      console.error('Error during logout:', e);
    }
    
    setHasProfile(false);
    
    // Перенаправляем на страницу входа и перезагружаем
    window.location.href = '/my-collections';
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
