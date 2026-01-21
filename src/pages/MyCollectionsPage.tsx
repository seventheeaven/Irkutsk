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

interface UserAccount {
  email: string;
  password: string;
  profile: UserProfile;
}

export const MyCollectionsPage = () => {
  const [hasProfile, setHasProfile] = useState<boolean>(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState('collections');
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isTabbarVisible, setIsTabbarVisible] = useState(true);
  const [likedItems, setLikedItems] = useState<LikedItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [publicationTitle, setPublicationTitle] = useState('');
  const [authStep, setAuthStep] = useState<'initial' | 'email'>('initial');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastScrollYRef = useRef(0);
  const isInitialLoadRef = useRef(true);

  // Получаем список зарегистрированных пользователей
  const getRegisteredUsers = (): UserAccount[] => {
    const users = localStorage.getItem('registeredUsers');
    return users ? JSON.parse(users) : [];
  };

  // Сохраняем зарегистрированного пользователя
  const saveUser = (userAccount: UserAccount) => {
    const users = getRegisteredUsers();
    const existingUserIndex = users.findIndex(u => u.email === userAccount.email);
    if (existingUserIndex >= 0) {
      users[existingUserIndex] = userAccount;
    } else {
      users.push(userAccount);
    }
    localStorage.setItem('registeredUsers', JSON.stringify(users));
  };

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

  // Обработка регистрации
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password || !name) {
      setError('Заполните все поля');
      return;
    }

    if (!email.includes('@')) {
      setError('Введите корректный email');
      return;
    }

    if (password.length < 6) {
      setError('Пароль должен быть не менее 6 символов');
      return;
    }

    const users = getRegisteredUsers();
    if (users.find(u => u.email === email)) {
      setError('Пользователь с таким email уже зарегистрирован');
      return;
    }

    const newProfile: UserProfile = {
      name: name.trim(),
      username: `@${email.split('@')[0]}`,
      description: '',
      avatar: undefined
    };

    const newUser: UserAccount = {
      email,
      password,
      profile: newProfile
    };

    saveUser(newUser);
    localStorage.setItem('userProfile', JSON.stringify(newProfile));
    setProfile(newProfile);
    setHasProfile(true);
  };

  // Обработка входа
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Заполните все поля');
      return;
    }

    const users = getRegisteredUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      setError('Неверный email или пароль');
      return;
    }

    localStorage.setItem('userProfile', JSON.stringify(user.profile));
    setProfile(user.profile);
    setHasProfile(true);
  };

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



  const handleBackClick = () => {
    setAuthStep('initial');
    setError('');
    setEmail('');
    setPassword('');
    setName('');
  };

  // Если профиля нет, показываем страницу входа
  if (!hasProfile) {
    // Начальный экран с кнопкой "Войти"
    if (authStep === 'initial') {
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
              <div className="my-collections-page__create-account-buttons">
                <button
                  className="my-collections-page__create-account-register-btn"
                  onClick={() => setAuthStep('email')}
                >
                  Войти
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Экран с формой авторизации
    return (
      <div className="my-collections-page">
        <div className="my-collections-page__create-account">
          <div className="my-collections-page__create-account-gradient">
            <button 
              className="my-collections-page__auth-back-btn"
              onClick={handleBackClick}
            >
              ← Назад
            </button>
            <div className="my-collections-page__auth-form-container">
              <div className="my-collections-page__auth-tabs">
                <button
                  className={`my-collections-page__auth-tab ${authMode === 'login' ? 'my-collections-page__auth-tab--active' : ''}`}
                  onClick={() => {
                    setAuthMode('login');
                    setError('');
                  }}
                >
                  Войти
                </button>
                <button
                  className={`my-collections-page__auth-tab ${authMode === 'register' ? 'my-collections-page__auth-tab--active' : ''}`}
                  onClick={() => {
                    setAuthMode('register');
                    setError('');
                  }}
                >
                  Регистрация
                </button>
              </div>
              
              {error && (
                <div className="my-collections-page__auth-error">
                  {error}
                </div>
              )}

              {authMode === 'login' ? (
                <form onSubmit={handleLogin} className="my-collections-page__auth-form">
                  <input
                    type="email"
                    className="my-collections-page__auth-input"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <input
                    type="password"
                    className="my-collections-page__auth-input"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button type="submit" className="my-collections-page__create-account-register-btn">
                    Войти
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="my-collections-page__auth-form">
                  <input
                    type="text"
                    className="my-collections-page__auth-input"
                    placeholder="Имя"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <input
                    type="email"
                    className="my-collections-page__auth-input"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <input
                    type="password"
                    className="my-collections-page__auth-input"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button type="submit" className="my-collections-page__create-account-register-btn">
                    Зарегистрироваться
                  </button>
                </form>
              )}
            </div>
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

