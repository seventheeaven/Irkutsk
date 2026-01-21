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
        console.log('AuthCallbackPage: Verifying token...');
        // Проверяем токен
        const resp = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        
        const data = await resp.json();
        console.log('AuthCallbackPage: Verify response', { ok: resp.ok, data });
        
        if (!resp.ok) {
          setError(data?.error || 'Неверный или истекший токен');
          setStatus('error');
          return;
        }

        const userEmail = data.email;
        console.log('AuthCallbackPage: User email', userEmail);

        // Проверяем, есть ли уже профиль для этого email
        let profileData;
        let profileResp;
        try {
          profileResp = await fetch(`/api/users/profile?email=${encodeURIComponent(userEmail)}`);
          profileData = await profileResp.json();
        } catch (e) {
          console.error('Error fetching profile:', e);
          setError('Ошибка при проверке профиля');
          setStatus('error');
          return;
        }

        if (profileResp.ok && profileData.profile) {
          // Пользователь уже зарегистрирован - сохраняем сессию
          const profile = profileData.profile;
          console.log('AuthCallbackPage: Existing user found', profile);
          
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
          console.log('AuthCallbackPage: New user, redirecting to profile setup');
          sessionStorage.setItem('pendingEmail', userEmail);
          document.cookie = `pendingEmail=${userEmail}; path=/; max-age=${60 * 60}; SameSite=Lax`;
          
          setStatus('success');
          
          setTimeout(() => {
            navigate('/my-collections?setup=profile');
          }, 1000);
        }
      } catch (e) {
        console.error('Error during token verification:', e);
        setError(`Не удалось войти по ссылке: ${e instanceof Error ? e.message : 'Неизвестная ошибка'}`);
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

