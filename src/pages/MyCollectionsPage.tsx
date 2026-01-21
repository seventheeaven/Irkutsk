import { useState, useEffect, useRef } from 'react';
import { Header } from '../components/Header';
import plusIcon from '../../img/plus.svg';
import collectionsImage from '../../img/collections.jpg';
import logoSuda from '../../img/logo_suda.svg';
import signInImage from '../../img/sign_in.png';
import arrowBackIcon from '../../img/arrow_back.svg';
import eyeIcon from '../../img/eye.svg';
import eyeOffIcon from '../../img/eye-off.svg';
import './MyCollectionsPage.css';

interface Collection {
  id: string;
  name: string;
  imageUrls: string[];
  itemCount: number;
  userId?: string;
  authorName?: string;
  authorUsername?: string;
  createdAt?: number;
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
  email?: string;
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
  const [authStep, setAuthStep] = useState<'initial' | 'email' | 'profileSetup'>('initial');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSendingLink, setIsSendingLink] = useState(false);
  const [linkSentTo, setLinkSentTo] = useState<string | null>(null);
  const [profileName, setProfileName] = useState('');
  const [profileUsername, setProfileUsername] = useState('');
  const [profilePassword, setProfilePassword] = useState('');
  const [isProfilePasswordVisible, setIsProfilePasswordVisible] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoginPasswordVisible, setIsLoginPasswordVisible] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isVerifyingToken, setIsVerifyingToken] = useState(false);
  const [loadingDots, setLoadingDots] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastScrollYRef = useRef(0);
  const isInitialLoadRef = useRef(true);
  const tokenVerifiedRef = useRef(false);

  // Загружаем профиль пользователя из KV
  const loadUserProfile = async (userEmail: string): Promise<UserProfile | null> => {
    try {
      // Нормализуем email
      const normalizedEmail = userEmail.toLowerCase().trim();
      console.log('loadUserProfile: Loading profile', { original: userEmail, normalized: normalizedEmail });
      const resp = await fetch(`/api/users/profile?email=${encodeURIComponent(normalizedEmail)}`);
      const data = await resp.json();
      console.log('loadUserProfile: Response', { ok: resp.ok, hasProfile: !!data.profile });
      if (resp.ok && data.profile) {
        return data.profile;
      }
      return null;
    } catch (error) {
      console.error('Error loading profile:', error);
      return null;
    }
  };

  // Сохраняем профиль пользователя в KV
  const saveUserProfile = async (userEmail: string, userProfile: UserProfile): Promise<boolean> => {
    try {
      console.log('saveUserProfile: Saving', { email: userEmail, profile: userProfile });
      const resp = await fetch('/api/users/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, profile: userProfile }),
      });
      const data = await resp.json();
      console.log('saveUserProfile: Response', { ok: resp.ok, data });
      return resp.ok && data.ok;
    } catch (error) {
      console.error('Error saving profile:', error);
      return false;
    }
  };

  // Загружаем все публикации из KV
  const loadAllPublications = async (): Promise<Collection[]> => {
    try {
      const resp = await fetch('/api/publications/list');
      const data = await resp.json();
      if (resp.ok && data.publications) {
        return data.publications;
      }
      return [];
    } catch (error) {
      console.error('Error loading publications:', error);
      return [];
    }
  };

  // Создаем публикацию в KV
  const createPublication = async (publication: Collection): Promise<boolean> => {
    try {
      const resp = await fetch('/api/publications/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(publication),
      });
      const data = await resp.json();
      return resp.ok && data.ok;
    } catch (error) {
      console.error('Error creating publication:', error);
      return false;
    }
  };

  // Удаляем публикацию из KV
  const deletePublication = async (publicationId: string): Promise<boolean> => {
    try {
      const resp = await fetch('/api/publications/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicationId }),
      });
      const data = await resp.json();
      return resp.ok && data.ok;
    } catch (error) {
      console.error('Error deleting publication:', error);
      return false;
    }
  };

  // Проверяем cookies для восстановления сессии (приоритет над localStorage)
  useEffect(() => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };

    // Проверяем, не был ли выполнен выход (проверяем флаг в sessionStorage)
    const wasLoggedOut = sessionStorage.getItem('loggedOut');
    if (wasLoggedOut === 'true') {
      sessionStorage.removeItem('loggedOut');
      setHasProfile(false);
      return;
    }

    const userEmail = getCookie('userEmail');
    if (userEmail) {
      (async () => {
        const kvProfile = await loadUserProfile(userEmail);
        if (kvProfile) {
          setProfile(kvProfile);
          setHasProfile(true);
          localStorage.setItem('userProfile', JSON.stringify(kvProfile));
          return; // Не проверяем localStorage если нашли в cookies
        }
      })();
    } else {
      // Если нет cookies, проверяем localStorage (для обратной совместимости)
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        try {
          const profileData: UserProfile = JSON.parse(savedProfile);
          if (profileData.email) {
            (async () => {
              const kvProfile = await loadUserProfile(profileData.email!);
              if (kvProfile) {
                setProfile(kvProfile);
                setHasProfile(true);
                localStorage.setItem('userProfile', JSON.stringify(kvProfile));
              } else {
                // Если профиля нет в KV, но есть в localStorage, используем его
                setProfile(profileData);
                setHasProfile(true);
              }
            })();
          } else {
            setProfile(profileData);
            setHasProfile(true);
          }
        } catch (error) {
          console.error('Error loading profile:', error);
          setHasProfile(false);
        }
      } else {
        setHasProfile(false);
      }
    }
  }, []);

  // Проверяем setup=profile для настройки профиля нового пользователя
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const setup = params.get('setup');
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };

    if (setup === 'profile') {
      const pendingEmail = getCookie('pendingEmail') || sessionStorage.getItem('pendingEmail');
      if (pendingEmail) {
        setVerifiedEmail(pendingEmail);
        setAuthStep('profileSetup');
        const usernameBase = pendingEmail.split('@')[0] || 'user';
        setProfileUsername(`@${usernameBase}`);
        // Очищаем URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  // Сначала проверяем токен, если он есть в URL (старая логика для обратной совместимости)
  useEffect(() => {
    // Если токен уже проверен, не проверяем повторно
    if (tokenVerifiedRef.current) return;

    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    
    // Если токена нет, не делаем ничего (профиль уже загружен через cookies/localStorage выше)
    if (!token) {
      return;
    }

    // Если есть токен - проверяем его (не проверяем повторно, если уже проверяем)
    if (isVerifyingToken) return;
    
    setIsVerifyingToken(true);
    tokenVerifiedRef.current = true;

    (async () => {
      try {
        setError('');
        const resp = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const data = await resp.json();
        if (!resp.ok) {
          setError(data?.error || 'Не удалось войти по ссылке');
          setIsVerifyingToken(false);
          return;
        }

        const userEmail = data.email;
        setVerifiedEmail(userEmail);

        // Чистим URL сразу после успешной проверки
        window.history.replaceState({}, document.title, window.location.pathname);

        // Проверяем, есть ли уже профиль для этого email в KV
        const existingProfile = await loadUserProfile(userEmail);

        if (existingProfile) {
          // Пользователь уже зарегистрирован - логиним сразу
          localStorage.setItem('userProfile', JSON.stringify(existingProfile));
          setProfile(existingProfile);
          setHasProfile(true);
        } else {
          // Новый пользователь - показываем форму настройки профиля
          setAuthStep('profileSetup');
          const usernameBase = userEmail.split('@')[0] || 'user';
          setProfileUsername(`@${usernameBase}`);
        }

        setIsVerifyingToken(false);
      } catch {
        setError('Не удалось войти по ссылке');
        setIsVerifyingToken(false);
      }
    })();
  }, []);

  // Загружаем публикации текущего пользователя
  useEffect(() => {
    if (!hasProfile || !profile || !profile.email) return;

    (async () => {
      const allPublications = await loadAllPublications();
      const userPublications = allPublications.filter(
        pub => pub.userId === profile.email || pub.authorName === profile.name
      );
      setCollections(userPublications);
    })();
  }, [hasProfile, profile]);

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLinkSentTo(null);

    if (!email || !email.includes('@')) {
      setError('Введите корректный email');
      return;
    }

    // Нормализуем email
    const normalizedEmail = email.toLowerCase().trim();
    console.log('handleSendMagicLink: Sending magic link', { original: email, normalized: normalizedEmail, mode: authMode });

    try {
      setIsSendingLink(true);
      const resp = await fetch('/api/auth/request-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, mode: authMode }),
      });
      const data = await resp.json();
      console.log('handleSendMagicLink: Response', { ok: resp.ok, data });
      if (!resp.ok) {
        setError(data?.error || 'Не удалось отправить ссылку');
        return;
      }
      setLinkSentTo(normalizedEmail);
    } catch (error) {
      console.error('handleSendMagicLink: Error', error);
      setError('Не удалось отправить ссылку');
    } finally {
      setIsSendingLink(false);
    }
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

  const handlePublish = async () => {
    if (publicationTitle.trim() && selectedImage && profile) {
      const newCollection: Collection = {
        id: Date.now().toString(),
        name: publicationTitle.trim(),
        imageUrls: [selectedImage],
        itemCount: 1,
        userId: profile.email,
        authorName: profile.name,
        authorUsername: profile.username,
        createdAt: Date.now()
      };
      
      // Сохраняем в KV
      const success = await createPublication(newCollection);
      
      if (success) {
        // Обновляем локальное состояние
        setCollections([...collections, newCollection]);
        handleCloseModal();
      } else {
        setError('Не удалось опубликовать');
      }
    }
  };

  const handleDeletePublication = async (publicationId: string) => {
    // Удаляем из KV
    const success = await deletePublication(publicationId);
    
    if (success) {
      // Обновляем локальное состояние
      setCollections(collections.filter(c => c.id !== publicationId));
    } else {
      setError('Не удалось удалить публикацию');
    }
  };



  const handleBackClick = () => {
    setAuthStep('initial');
    setError('');
    setEmail('');
    setLinkSentTo(null);
    setProfileName('');
    setProfileUsername('');
    setProfilePassword('');
    setLoginPassword('');
    setVerifiedEmail(null);
  };

  const handleProfileSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!profileName.trim() || !profileUsername.trim() || !profilePassword.trim()) {
      setError('Заполните все поля');
      return;
    }

    if (profilePassword.length < 6) {
      setError('Пароль должен быть не менее 6 символов');
      return;
    }

    if (!verifiedEmail) {
      setError('Ошибка: email не найден');
      return;
    }

    const normalizedUsername = profileUsername.trim().startsWith('@') 
      ? profileUsername.trim() 
      : `@${profileUsername.trim()}`;

    // Проверяем уникальность username
    try {
      const checkResp = await fetch('/api/users/check-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: normalizedUsername, currentEmail: verifiedEmail }),
      });
      const checkData = await checkResp.json();
      
      if (!checkData.available) {
        setError('Этот username уже занят. Пожалуйста, выберите другой.');
        return;
      }
    } catch (error) {
      console.error('Error checking username:', error);
      setError('Не удалось проверить username');
      return;
    }

    // Нормализуем email
    const normalizedEmail = verifiedEmail.toLowerCase().trim();
    
    // Хэшируем пароль на клиенте (простой SHA256, в продакшене лучше использовать bcrypt на сервере)
    const passwordHash = await sha256(profilePassword);
    
    const newProfile: UserProfile & { passwordHash: string } = {
      name: profileName.trim(),
      username: normalizedUsername,
      description: '',
      avatar: undefined,
      email: normalizedEmail,
      passwordHash: passwordHash,
    };

    // Сохраняем пользователя в KV
    console.log('MyCollectionsPage: Saving profile', { original: verifiedEmail, normalized: normalizedEmail });
    const success = await saveUserProfile(normalizedEmail, newProfile);
    console.log('MyCollectionsPage: Save result', success);
    
    if (success) {
      // Убираем passwordHash из профиля перед сохранением в localStorage
      const { passwordHash: _, ...profileWithoutPassword } = newProfile;
      
      // Сохраняем в localStorage для обратной совместимости
      localStorage.setItem('userProfile', JSON.stringify(profileWithoutPassword));
      
      // Сохраняем в cookies для синхронизации между браузерами (используем нормализованный email)
      document.cookie = `userEmail=${normalizedEmail}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
      
      setProfile(profileWithoutPassword);
      setHasProfile(true);
    } else {
      setError('Не удалось сохранить профиль. Попробуйте еще раз.');
    }
  };

  // Функция для хэширования пароля
  const sha256 = async (message: string): Promise<string> => {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  };

  // Анимация точек при загрузке
  useEffect(() => {
    if (!isLoggingIn) {
      setLoadingDots('');
      return;
    }

    let dotCount = 0;
    const interval = setInterval(() => {
      dotCount = (dotCount + 1) % 4; // 0, 1, 2, 3, потом снова 0
      setLoadingDots('.'.repeat(dotCount));
    }, 500); // Меняем каждые 500мс

    return () => clearInterval(interval);
  }, [isLoggingIn]);

  // Обработка входа по email и паролю
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);

    if (!email.trim() || !loginPassword.trim()) {
      setError('Введите email и пароль');
      setIsLoggingIn(false);
      return;
    }

    try {
      const normalizedEmail = email.toLowerCase().trim();
      const resp = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, password: loginPassword }),
      });
      
      const data = await resp.json();
      console.log('handleLogin: Response', { ok: resp.ok, data });
      
      if (!resp.ok) {
        setError(data?.error || 'Неверный email или пароль');
        setIsLoggingIn(false);
        return;
      }

      // Успешный вход
      const profile = data.profile;
      
      // Сохраняем в localStorage
      localStorage.setItem('userProfile', JSON.stringify(profile));
      
      // Сохраняем в cookies
      document.cookie = `userEmail=${normalizedEmail}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
      
      setProfile(profile);
      setHasProfile(true);
    } catch (error) {
      console.error('handleLogin: Error', error);
      setError('Не удалось войти. Попробуйте еще раз.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Если профиля нет, показываем страницу входа
  if (!hasProfile) {
    // Показываем загрузку во время проверки токена
    if (isVerifyingToken) {
      return (
        <div className="my-collections-page">
          <div className="my-collections-page__create-account">
            <div className="my-collections-page__create-account-gradient">
              <div className="my-collections-page__auth-form-container">
                <p style={{ textAlign: 'center', color: '#111', fontSize: '16px' }}>Проверяем ссылку...</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

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
                  onClick={() => {
                    setAuthMode('register');
                    setAuthStep('email');
                  }}
                >
                  Зарегистрироваться
                </button>
                <button
                  className="my-collections-page__create-account-login-btn"
                  onClick={() => {
                    setAuthMode('login');
                    setAuthStep('email');
                  }}
                >
                  Войти
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Экран настройки профиля для новых пользователей
    if (authStep === 'profileSetup') {
      return (
        <div className="my-collections-page">
          <div className="my-collections-page__create-account">
            <div className="my-collections-page__create-account-gradient">
              <button 
                className="my-collections-page__auth-back-btn"
                onClick={handleBackClick}
                aria-label="Назад"
              >
                <img src={arrowBackIcon} alt="Назад" style={{ width: 24, height: 24 }} />
              </button>
              <div className="my-collections-page__auth-form-container">
                <h2 className="my-collections-page__profile-setup-title">Настройка профиля</h2>
                <p className="my-collections-page__profile-setup-subtitle">Введите ваше имя, username и пароль</p>
                
                {error && (
                  <div className="my-collections-page__auth-error">
                    {error}
                  </div>
                )}

                <form onSubmit={handleProfileSetup} className="my-collections-page__auth-form">
                  <input
                    type="text"
                    className="my-collections-page__auth-input"
                    placeholder="Имя"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    className="my-collections-page__auth-input"
                    placeholder="Username (например: @username)"
                    value={profileUsername}
                    onChange={(e) => setProfileUsername(e.target.value)}
                    required
                  />
                  <div className="my-collections-page__password-wrapper">
                    <input
                      type={isProfilePasswordVisible ? 'text' : 'password'}
                      className="my-collections-page__auth-input"
                      placeholder="Пароль (минимум 6 символов)"
                      value={profilePassword}
                      onChange={(e) => setProfilePassword(e.target.value)}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="my-collections-page__password-toggle"
                      onClick={() => setIsProfilePasswordVisible(prev => !prev)}
                    >
                      <img 
                        src={isProfilePasswordVisible ? eyeIcon : eyeOffIcon} 
                        alt={isProfilePasswordVisible ? 'Скрыть пароль' : 'Показать пароль'}
                        className="my-collections-page__password-toggle-icon"
                      />
                    </button>
                  </div>
                  <button
                    type="submit"
                    className="my-collections-page__create-account-register-btn"
                  >
                    Сохранить
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Экран с формой авторизации
    if (authMode === 'login') {
      // Форма входа с email и паролем
      return (
        <div className="my-collections-page">
          <div className="my-collections-page__create-account">
            <div className="my-collections-page__create-account-gradient">
              <button 
                className="my-collections-page__auth-back-btn"
                onClick={handleBackClick}
                aria-label="Назад"
              >
                <img src={arrowBackIcon} alt="Назад" style={{ width: 24, height: 24 }} />
              </button>
              <div className="my-collections-page__auth-form-container">
                {error && (
                  <div className="my-collections-page__auth-error">
                    {error}
                  </div>
                )}

                <form onSubmit={handleLogin} className="my-collections-page__auth-form">
                  <input
                    type="email"
                    className="my-collections-page__auth-input"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                  <div className="my-collections-page__password-wrapper">
                    <input
                      type={isLoginPasswordVisible ? 'text' : 'password'}
                      className="my-collections-page__auth-input"
                      placeholder="Пароль"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="my-collections-page__password-toggle"
                      onClick={() => setIsLoginPasswordVisible(prev => !prev)}
                    >
                      <img 
                        src={isLoginPasswordVisible ? eyeIcon : eyeOffIcon} 
                        alt={isLoginPasswordVisible ? 'Скрыть пароль' : 'Показать пароль'}
                        className="my-collections-page__password-toggle-icon"
                      />
                    </button>
                  </div>
                  <button
                    type="submit"
                    className="my-collections-page__create-account-register-btn"
                    disabled={isLoggingIn}
                  >
                    {isLoggingIn ? `Вхожу${loadingDots}` : 'Войти'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Форма регистрации (magic link)
    return (
      <div className="my-collections-page">
        <div className="my-collections-page__create-account">
          <div className="my-collections-page__create-account-gradient">
            <button 
              className="my-collections-page__auth-back-btn"
              onClick={handleBackClick}
              aria-label="Назад"
            >
              <img src={arrowBackIcon} alt="Назад" style={{ width: 24, height: 24 }} />
            </button>
            <div className="my-collections-page__auth-form-container">
              {error && (
                <div className="my-collections-page__auth-error">
                  {error}
                </div>
              )}

              {linkSentTo ? (
                <>
                  <p className="my-collections-page__auth-success-text">
                    Ссылка для регистрации отправлена на <strong>{linkSentTo}</strong>
                    <br />
                    <br />
                    После того, как придумаете пароль возвращайтесь,
                  </p>
                  <form onSubmit={handleLogin} className="my-collections-page__auth-form">
                    <input
                      type="email"
                      className="my-collections-page__auth-input"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <div className="my-collections-page__password-wrapper">
                      <input
                        type={isLoginPasswordVisible ? 'text' : 'password'}
                        className="my-collections-page__auth-input"
                        placeholder="Пароль"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="my-collections-page__password-toggle"
                        onClick={() => setIsLoginPasswordVisible(prev => !prev)}
                      >
                        <img 
                          src={isLoginPasswordVisible ? eyeIcon : eyeOffIcon} 
                          alt={isLoginPasswordVisible ? 'Скрыть пароль' : 'Показать пароль'}
                          className="my-collections-page__password-toggle-icon"
                        />
                      </button>
                    </div>
                    <button
                      type="submit"
                      className="my-collections-page__create-account-register-btn"
                      disabled={isLoggingIn}
                    >
                      {isLoggingIn ? `Вхожу${loadingDots}` : 'Войти'}
                    </button>
                  </form>
                </>
              ) : (
                <form onSubmit={handleSendMagicLink} className="my-collections-page__auth-form">
                  <input
                    type="email"
                    className="my-collections-page__auth-input"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <button
                    type="submit"
                    className="my-collections-page__create-account-register-btn"
                    disabled={isSendingLink}
                  >
                    {isSendingLink ? 'Отправляем...' : 'Отправить ссылку'}
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
                      <button
                        className="my-collections-page__collection-delete"
                        onClick={() => handleDeletePublication(collection.id)}
                        title="Удалить публикацию"
                      >
                        ✕
                      </button>
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

