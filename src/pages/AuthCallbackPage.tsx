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
        // Проверяем токен с retry логикой
        let resp;
        let lastError;
        const maxRetries = 3;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            console.log(`AuthCallbackPage: Attempt ${attempt}/${maxRetries}`);
            // Создаем AbortController для таймаута
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 секунд
            
            resp = await fetch('/api/auth/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token }),
              signal: controller.signal,
            });
            
            clearTimeout(timeoutId);
            break; // Успешно, выходим из цикла
          } catch (fetchError) {
            lastError = fetchError;
            console.error(`AuthCallbackPage: Fetch error (attempt ${attempt}/${maxRetries})`, fetchError);
            
            if (attempt < maxRetries) {
              // Ждем перед повтором (экспоненциальная задержка)
              await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
              continue;
            } else {
              // Все попытки исчерпаны
              let errorMsg = 'Не удалось подключиться к серверу.';
              if (fetchError instanceof Error) {
                if (fetchError.name === 'TimeoutError' || fetchError.message.includes('timeout')) {
                  errorMsg = 'Превышено время ожидания. Проверьте интернет-соединение.';
                } else if (fetchError.message.includes('network') || fetchError.message.includes('fetch')) {
                  errorMsg = 'Проблема с сетью. Проверьте интернет-соединение.';
                }
              }
              setError(errorMsg);
              setStatus('error');
              return;
            }
          }
        }
        
        let data;
        try {
          data = await resp.json();
        } catch (jsonError) {
          console.error('AuthCallbackPage: JSON parse error', jsonError);
          setError('Ошибка при обработке ответа сервера. Попробуйте снова.');
          setStatus('error');
          return;
        }
        
        console.log('AuthCallbackPage: Verify response', { ok: resp.ok, data });
        
        if (!resp.ok) {
          setError(data?.error || 'Неверный или истекший токен');
          setStatus('error');
          return;
        }

        // Нормализуем email
        const userEmail = data.email.toLowerCase().trim();
        console.log('AuthCallbackPage: User email', { original: data.email, normalized: userEmail });

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
          if (typeof sessionStorage !== 'undefined') {
            try {
              sessionStorage.setItem('pendingEmail', userEmail);
            } catch (e) {
              console.error('Error saving to sessionStorage:', e);
            }
          }
          if (typeof document !== 'undefined') {
            try {
              document.cookie = `pendingEmail=${userEmail}; path=/; max-age=${60 * 60}; SameSite=Lax`;
            } catch (e) {
              console.error('Error setting cookie:', e);
            }
          }
          
          setStatus('success');
          
          setTimeout(() => {
            navigate('/my-collections?setup=profile');
          }, 1000);
        }
      } catch (e) {
        console.error('Error during token verification:', e);
        let errorMessage = 'Не удалось войти по ссылке';
        if (e instanceof Error) {
          if (e.message.includes('fetch') || e.message.includes('network') || e.message.includes('Load failed')) {
            errorMessage = 'Проблема с подключением. Проверьте интернет и попробуйте снова.';
          } else {
            errorMessage = `Не удалось войти по ссылке: ${e.message}`;
          }
        }
        setError(errorMessage);
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

