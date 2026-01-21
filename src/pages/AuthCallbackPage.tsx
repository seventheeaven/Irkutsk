import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './AuthCallbackPage.css';

export const AuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setError('Токен не найден');
      setStatus('error');
      return;
    }

    (async () => {
      try {
        // Проверяем токен
        const resp = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        
        const data = await resp.json();
        
        if (!resp.ok) {
          setError(data?.error || 'Неверный или истекший токен');
          setStatus('error');
          return;
        }

        const userEmail = data.email;

        // Проверяем, есть ли уже профиль для этого email
        const profileResp = await fetch(`/api/users/profile?email=${encodeURIComponent(userEmail)}`);
        const profileData = await profileResp.json();

        if (profileResp.ok && profileData.profile) {
          // Пользователь уже зарегистрирован - сохраняем сессию
          const profile = profileData.profile;
          
          // Сохраняем в localStorage (для текущего браузера)
          localStorage.setItem('userProfile', JSON.stringify(profile));
          
          // Сохраняем в cookies (для синхронизации между браузерами)
          document.cookie = `userEmail=${userEmail}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
          
          setStatus('success');
          
          // Перенаправляем на страницу профиля через 1 секунду
          setTimeout(() => {
            navigate('/my-collections');
          }, 1000);
        } else {
          // Новый пользователь - сохраняем email в sessionStorage и перенаправляем на настройку профиля
          sessionStorage.setItem('pendingEmail', userEmail);
          document.cookie = `pendingEmail=${userEmail}; path=/; max-age=${60 * 60}; SameSite=Lax`;
          
          setStatus('success');
          
          setTimeout(() => {
            navigate('/my-collections?setup=profile');
          }, 1000);
        }
      } catch (e) {
        console.error('Error during token verification:', e);
        setError('Не удалось войти по ссылке');
        setStatus('error');
      }
    })();
  }, [searchParams, navigate]);

  if (status === 'loading') {
    return (
      <div className="auth-callback-page">
        <div className="auth-callback-page__content">
          <div className="auth-callback-page__spinner"></div>
          <p className="auth-callback-page__message">Проверяем ссылку...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="auth-callback-page">
        <div className="auth-callback-page__content">
          <div className="auth-callback-page__error-icon">⚠️</div>
          <p className="auth-callback-page__message auth-callback-page__message--error">{error}</p>
          <button 
            className="auth-callback-page__button"
            onClick={() => navigate('/my-collections')}
          >
            Вернуться на страницу входа
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-callback-page">
      <div className="auth-callback-page__content">
        <div className="auth-callback-page__success-icon">✓</div>
        <p className="auth-callback-page__message auth-callback-page__message--success">
          Успешный вход!
        </p>
        <p className="auth-callback-page__hint">
          Перенаправляем...
        </p>
      </div>
    </div>
  );
};

