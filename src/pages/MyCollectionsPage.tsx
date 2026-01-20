import { useState, useEffect, useRef } from 'react';
import { Header } from '../components/Header';
import plusIcon from '../../img/plus.svg';
import collectionsImage from '../../img/collections.jpg';
import logoSuda from '../../img/logo_suda.svg';
import signInImage from '../../img/sign_in.png';
import './MyCollectionsPage.css';

interface Collection {
  id: string;
  name: string;
  imageUrls: string[];
  itemCount: number;
}

interface LikedItem {
  id: string;
  imageUrl: string;
  description: string;
  title?: string;
  address?: string;
}

interface UserProfile {
  name: string;
  username: string;
  description: string;
  avatar?: string;
}

type AuthStep = 'initial' | 'phone' | 'code';

export const MyCollectionsPage = () => {
  const [hasProfile, setHasProfile] = useState<boolean>(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authStep, setAuthStep] = useState<AuthStep>('initial');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [sentCode, setSentCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('collections');
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isTabbarVisible, setIsTabbarVisible] = useState(true);
  const [likedItems, setLikedItems] = useState<LikedItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [publicationTitle, setPublicationTitle] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastScrollYRef = useRef(0);
  const isInitialLoadRef = useRef(true);

  // Загружаем профиль из localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      try {
        const profileData: UserProfile = JSON.parse(savedProfile);
        setProfile(profileData);
        setHasProfile(true);
      } catch (error) {
        console.error('Error loading profile:', error);
        setHasProfile(false);
      }
    } else {
      setHasProfile(false);
    }
  }, []);

  // Загружаем Telegram Widget для авторизации
  useEffect(() => {
    if (authStep === 'phone' && !hasProfile) {
      // Очищаем предыдущий виджет, если есть
      const container = document.getElementById('telegram-login');
      if (container) {
        container.innerHTML = '';
      }

      const script = document.createElement('script');
      script.src = 'https://telegram.org/js/telegram-widget.js?22';
      script.async = true;
      script.setAttribute('data-telegram-login', 'USERNAME_ТВОЕГО_БОТА'); // Замените на username вашего бота
      script.setAttribute('data-size', 'large');
      script.setAttribute('data-userpic', 'false');
      script.setAttribute('data-request-access', 'write');
      script.setAttribute('data-onauth', 'onTelegramAuth(user)');
      
      if (container) {
        container.appendChild(script);
      }

      // Глобальная функция для обработки авторизации
      (window as any).onTelegramAuth = function (user: any) {
        console.log('Telegram user:', user);
        
        // Создаем профиль из данных Telegram
        const newProfile: UserProfile = {
          name: user.first_name + (user.last_name ? ' ' + user.last_name : ''),
          username: user.username ? `@${user.username}` : `@user${user.id}`,
          description: '',
          avatar: user.photo_url
        };
        
        localStorage.setItem('userProfile', JSON.stringify(newProfile));
        setProfile(newProfile);
        setHasProfile(true);
        setAuthStep('initial');
      };

      return () => {
        // Очистка при размонтировании
        if (container) {
          container.innerHTML = '';
        }
        delete (window as any).onTelegramAuth;
      };
    }
  }, [authStep, hasProfile]);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          
          if (currentScrollY < 10) {
            setIsTabbarVisible(true);
          } else if (currentScrollY > lastScrollYRef.current) {
            setIsTabbarVisible(false);
          } else if (currentScrollY < lastScrollYRef.current) {
            setIsTabbarVisible(true);
          }
          
          lastScrollYRef.current = currentScrollY;
          ticking = false;
        });
        
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Загружаем лайки из localStorage
  useEffect(() => {
    const loadLikes = () => {
      const savedLikedItems = localStorage.getItem('likedItemsDetails');
      if (savedLikedItems) {
        try {
          const items: LikedItem[] = JSON.parse(savedLikedItems);
          setLikedItems(items);
        } catch (error) {
          console.error('Error loading liked items:', error);
        }
      } else {
        setLikedItems([]);
      }
    };

    loadLikes();
    
    // Слушаем изменения в localStorage (для других вкладок)
    const handleStorageChange = () => {
      loadLikes();
    };
    
    // Слушаем фокус окна для обновления при возврате на страницу
    const handleFocus = () => {
      if (activeTab === 'likes') {
        loadLikes();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);
    
    // Также проверяем при изменении activeTab
    if (activeTab === 'likes') {
      loadLikes();
    }
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [activeTab]);

  // Автоматически выбираем активный таб на основе наличия данных (только при первой загрузке)
  useEffect(() => {
    if (isInitialLoadRef.current) {
      if (collections.length > 0) {
        // Если есть подборки - показываем подборки
        setActiveTab('collections');
        isInitialLoadRef.current = false;
      } else if (likedItems.length > 0) {
        // Если нет подборок, но есть лайки - показываем лайки
        setActiveTab('likes');
        isInitialLoadRef.current = false;
      }
      // Если нет ни того, ни другого - оставляем подборки (по умолчанию)
      // и помечаем, что первая загрузка завершена
      if (collections.length === 0 && likedItems.length === 0) {
        isInitialLoadRef.current = false;
      }
    }
  }, [collections.length, likedItems.length]);

  const maxLength = 150;
  const truncatedDescription = profile?.description 
    ? (profile.description.length > maxLength 
        ? profile.description.substring(0, maxLength) 
        : profile.description)
    : '';


  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
    setPublicationTitle('');
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = () => {
    if (publicationTitle.trim() && selectedImage) {
      const newCollection: Collection = {
        id: Date.now().toString(),
        name: publicationTitle.trim(),
        imageUrls: [selectedImage],
        itemCount: 1
      };
      setCollections([...collections, newCollection]);
      handleCloseModal();
    }
  };

  // Моковая система для хранения зарегистрированных номеров
  const getRegisteredPhones = (): string[] => {
    const phones = localStorage.getItem('registeredPhones');
    return phones ? JSON.parse(phones) : [];
  };

  const registerPhone = (phone: string) => {
    const phones = getRegisteredPhones();
    if (!phones.includes(phone)) {
      phones.push(phone);
      localStorage.setItem('registeredPhones', JSON.stringify(phones));
    }
  };

  const isPhoneRegistered = (phone: string): boolean => {
    return getRegisteredPhones().includes(phone);
  };


  const handleLoginClick = () => {
    setAuthStep('phone');
  };

  const handleBackClick = () => {
    setAuthStep('initial');
    setPhoneNumber('');
    setCode('');
    setSentCode(null);
  };


  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (code !== sentCode) {
      alert('Неверный код');
      return;
    }

    const normalizedPhone = phoneNumber.replace(/\D/g, '');

    // Регистрируем номер, если он еще не зарегистрирован
    if (!isPhoneRegistered(normalizedPhone)) {
      registerPhone(normalizedPhone);
    }

    // Создаем профиль
    const newProfile: UserProfile = {
      name: 'Пользователь',
      username: `@${normalizedPhone.slice(-4)}`,
      description: '',
      avatar: undefined
    };
    
    localStorage.setItem('userProfile', JSON.stringify(newProfile));
    setProfile(newProfile);
    setHasProfile(true);
    setAuthStep('initial');
    setPhoneNumber('');
    setCode('');
    setSentCode(null);
  };

  // Если профиля нет, показываем форму создания аккаунта
  if (!hasProfile) {
    return (
      <div className="my-collections-page">
        <div className="my-collections-page__create-account">
          <div className="my-collections-page__create-account-gradient">
            <img 
              src={signInImage} 
              alt="Sign in" 
              className="my-collections-page__sign-in-image"
            />
            <img 
              src={logoSuda} 
              alt="Logo Suda" 
              className="my-collections-page__logo-suda"
            />
            <p className="my-collections-page__create-account-text">
              Сохраняйте места<br />и делитесь своими публикациями
            </p>
            {authStep === 'initial' && (
              <div className="my-collections-page__create-account-buttons">
                <button
                  className="my-collections-page__create-account-register-btn"
                  onClick={handleLoginClick}
                >
                  Войти
                </button>
              </div>
            )}
          </div>
          <div className="my-collections-page__create-account-content">

            {authStep === 'phone' && (
              <div className="my-collections-page__auth-form">
                <button
                  className="my-collections-page__auth-back-btn"
                  onClick={handleBackClick}
                >
                  ← Назад
                </button>
                <div className="my-collections-page__telegram-login-container">
                  <div id="telegram-login" />
                </div>
              </div>
            )}

            {authStep === 'code' && (
              <div className="my-collections-page__auth-form">
                <button
                  className="my-collections-page__auth-back-btn"
                  onClick={handleBackClick}
                >
                  ← Назад
                </button>
                <form onSubmit={handleCodeSubmit} className="my-collections-page__auth-code-form">
                  <label className="my-collections-page__auth-label">
                    Введите код из SMS
                  </label>
                  <input
                    type="text"
                    className="my-collections-page__auth-input"
                    placeholder="0000"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    maxLength={4}
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="my-collections-page__create-account-register-btn"
                    disabled={code.length !== 4}
                  >
                    Подтвердить
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-collections-page">
      <div className="my-collections-page__bottom-layer">
        <Header />
      </div>
      <div className="my-collections-page__profile">
        <div 
          className="my-collections-page__avatar"
          style={profile?.avatar ? { backgroundImage: `url(${profile.avatar})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
        ></div>
        <h1 className="my-collections-page__name">{profile?.name || ''}</h1>
        <p className="my-collections-page__username">{profile?.username || ''}</p>
        <div className="my-collections-page__stats">
          <div className="my-collections-page__stat">
            <div className="my-collections-page__stat-number">0</div>
            <div className="my-collections-page__stat-label">подписки</div>
          </div>
          <div className="my-collections-page__stat">
            <div className="my-collections-page__stat-number">0</div>
            <div className="my-collections-page__stat-label">подписчики</div>
          </div>
        </div>
        <p className="my-collections-page__description">
          {truncatedDescription}
        </p>
        <div className="my-collections-page__tabs">
          <button
            className={`my-collections-page__tab ${activeTab === 'collections' ? 'my-collections-page__tab--active' : ''}`}
            onClick={() => {
              setActiveTab('collections');
              isInitialLoadRef.current = false;
            }}
          >
            публикации
          </button>
          <button
            className={`my-collections-page__tab ${activeTab === 'likes' ? 'my-collections-page__tab--active' : ''}`}
            onClick={() => {
              setActiveTab('likes');
              isInitialLoadRef.current = false;
            }}
          >
            лайки
          </button>
        </div>

        {activeTab === 'collections' && (
          <div className="my-collections-page__collections">

            {collections.length === 0 ? (
              <div className="my-collections-page__empty-collections">
                <p>
                  Публикаций пока что нет:(
                  <br />
                  Но вы не растраивайтесь!
                  <br />
                  Нажмите на&nbsp;+&nbsp;и&nbsp;создайте первую
                </p>
                <img 
                  src={collectionsImage} 
                  alt="Подборки" 
                  className="my-collections-page__empty-collections-image"
                />
              </div>
            ) : (
              <div className="my-collections-page__collections-grid">
                {collections.map((collection, index) => {
                  // Генерируем случайные высоты для эффекта Pinterest
                  const getRandomHeight = (idx: number) => {
                    const heights = [180, 220, 250, 200, 280, 190, 240, 210];
                    return heights[idx % heights.length];
                  };
                  
                  const imageUrl = collection.imageUrls[0] || '';
                  
                  return (
                    <div key={collection.id} className="my-collections-page__collection-card">
                      {imageUrl ? (
                        <img 
                          src={imageUrl}
                          alt={collection.name}
                          className="my-collections-page__collection-image"
                          style={{ height: `${getRandomHeight(index)}px` }}
                        />
                      ) : (
                        <div 
                          className="my-collections-page__collection-image"
                          style={{ height: `${getRandomHeight(index)}px` }}
                        ></div>
                      )}
                      <p className="my-collections-page__collection-description">{collection.name}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'likes' && (
          <div className="my-collections-page__likes">
            {likedItems.length === 0 ? (
              <div className="my-collections-page__empty-likes">
                <p>У вас пока нет лайков</p>
              </div>
            ) : (
              <div className="my-collections-page__likes-grid">
                {likedItems.map((item, index) => {
                  // Генерируем случайные высоты для эффекта Pinterest
                  const getRandomHeight = (idx: number) => {
                    const heights = [180, 220, 250, 200, 280, 190, 240, 210];
                    return heights[idx % heights.length];
                  };
                  
                  return (
                    <div key={item.id} className="my-collections-page__like-card">
                      <img 
                        src={item.imageUrl} 
                        alt={item.description}
                        className="my-collections-page__like-image"
                        style={{ height: `${getRandomHeight(index)}px` }}
                      />
                      <p className="my-collections-page__like-description">{item.description}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
      {activeTab === 'collections' && (
        <button
          className={`my-collections-page__add-btn ${!isTabbarVisible ? 'my-collections-page__add-btn--tabbar-hidden' : ''}`}
          onClick={handleOpenModal}
        >
          <img src={plusIcon} alt="Добавить" className="my-collections-page__add-icon" />
        </button>
      )}

      {isModalOpen && (
        <>
          <div className="my-collections-page__modal-overlay" onClick={handleCloseModal}></div>
          <div className="my-collections-page__modal">
            <div className="my-collections-page__modal-header">
              <h2 className="my-collections-page__modal-title">Создать публикацию</h2>
              <button 
                className="my-collections-page__modal-close"
                onClick={handleCloseModal}
              >
                ✕
              </button>
            </div>
            
            <div className="my-collections-page__modal-content">
              <div className="my-collections-page__modal-image-section">
                {selectedImage ? (
                  <div className="my-collections-page__modal-image-preview">
                    <img src={selectedImage} alt="Preview" />
                    <button
                      className="my-collections-page__modal-image-remove"
                      onClick={() => setSelectedImage(null)}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div 
                    className="my-collections-page__modal-image-placeholder"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <span className="my-collections-page__modal-image-icon">📷</span>
                    <span className="my-collections-page__modal-image-text">Добавить изображение</span>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  style={{ display: 'none' }}
                />
              </div>

              <input
                type="text"
                className="my-collections-page__modal-title-input"
                placeholder="Название публикации"
                value={publicationTitle}
                onChange={(e) => setPublicationTitle(e.target.value)}
                autoFocus
              />
            </div>

            <div className="my-collections-page__modal-actions">
              <button
                className="my-collections-page__modal-cancel"
                onClick={handleCloseModal}
              >
                Отмена
              </button>
              <button
                className="my-collections-page__modal-publish"
                onClick={handlePublish}
                disabled={!publicationTitle.trim() || !selectedImage}
              >
                Опубликовать
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

