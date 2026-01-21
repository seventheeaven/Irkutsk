import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import './SettingsPage.css';

interface UserProfile {
  name: string;
  username: string;
  description: string;
  avatar?: string;
  email?: string;
}

export const SettingsPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [description, setDescription] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Загружаем профиль из localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      try {
        const profileData: UserProfile = JSON.parse(savedProfile);
        setName(profileData.name || '');
        setUsername(profileData.username || '');
        setDescription(profileData.description || '');
        setAvatar(profileData.avatar || null);
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    }
  }, []);

  // Получаем список всех пользователей для проверки уникальности username
  const getAllUsers = (): { email: string; profile: UserProfile }[] => {
    const users = localStorage.getItem('registeredUsers');
    return users ? JSON.parse(users) : [];
  };

  // Получаем текущий профиль
  const getCurrentProfile = (): UserProfile | null => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      try {
        return JSON.parse(savedProfile);
      } catch {
        return null;
      }
    }
    return null;
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setError('');

    if (!name.trim()) {
      setError('Имя не может быть пустым');
      return;
    }

    if (!username.trim()) {
      setError('Username не может быть пустым');
      return;
    }

    // Нормализуем username (добавляем @ если нет)
    const normalizedUsername = username.trim().startsWith('@') 
      ? username.trim() 
      : `@${username.trim()}`;

    // Проверяем уникальность username
    const currentProfile = getCurrentProfile();
    const allUsers = getAllUsers();
    const existingUser = allUsers.find(
      u => u.profile.username === normalizedUsername && 
      u.profile.username !== currentProfile?.username
    );

    if (existingUser) {
      setError('Этот username уже занят');
      return;
    }

    // Обновляем профиль
    const updatedProfile: UserProfile = {
      name: name.trim(),
      username: normalizedUsername,
      description: description.trim(),
      avatar: avatar || undefined,
      email: currentProfile?.email,
    };

    // Сохраняем в localStorage
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));

    // Обновляем в списке пользователей
    if (currentProfile?.email) {
      const users = getAllUsers();
      const userIndex = users.findIndex(u => u.email === currentProfile.email);
      if (userIndex >= 0) {
        users[userIndex].profile = updatedProfile;
        localStorage.setItem('registeredUsers', JSON.stringify(users));
      }
    }

    navigate(-1);
  };

  const handleLogout = () => {
    localStorage.removeItem('userProfile');
    navigate('/my-collections');
  };

  return (
    <div className="settings-page">
      <div className="settings-page__header-wrapper">
        <Header />
        <button className="settings-page__back" onClick={handleBack}>
          ← Назад
        </button>
      </div>
      <div className="settings-page__content">
        <h1 className="settings-page__title">Настройки</h1>
        
        {error && (
          <div className="settings-page__error">
            {error}
          </div>
        )}

        <div className="settings-page__section">
          <label className="settings-page__label">Фото профиля</label>
          <div className="settings-page__avatar-section">
            <div 
              className="settings-page__avatar-preview"
              style={avatar ? { backgroundImage: `url(${avatar})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
              onClick={() => fileInputRef.current?.click()}
            >
              {!avatar && (
                <div className="settings-page__avatar-placeholder">
                  <span className="settings-page__avatar-icon">📷</span>
                  <span className="settings-page__avatar-text">Добавить фото</span>
                </div>
              )}
            </div>
            {avatar && (
              <button
                className="settings-page__avatar-remove"
                onClick={() => setAvatar(null)}
              >
                Удалить фото
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        <div className="settings-page__section">
          <label className="settings-page__label">Имя</label>
          <input
            type="text"
            className="settings-page__input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Введите имя"
          />
        </div>

        <div className="settings-page__section">
          <label className="settings-page__label">Username</label>
          <input
            type="text"
            className="settings-page__input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="@username"
          />
        </div>

        <div className="settings-page__section">
          <label className="settings-page__label">Описание</label>
          <textarea
            className="settings-page__textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Введите описание"
            maxLength={200}
            rows={6}
          />
          <div className="settings-page__char-count">
            {description.length}/200
          </div>
        </div>

        <div className="settings-page__actions">
          <button className="settings-page__save-btn" onClick={handleSave}>
            Сохранить
          </button>
          <button className="settings-page__logout-btn" onClick={handleLogout}>
            Выйти из аккаунта
          </button>
        </div>
      </div>
    </div>
  );
};




