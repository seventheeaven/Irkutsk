import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import './SettingsPage.css';

export const SettingsPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('Вероника');
  const [description, setDescription] = useState('Люблю утренний кофе, пробежки и экспериментировать на кухне. Мечтаю танцевать сальсу! Ищу того, с кем можно будет уютно молчать и весело смеяться, отправляться в спонтанные поездки и открывать новые книги');

  const handleBack = () => {
    navigate(-1);
  };

  const handleSave = () => {
    // TODO: Сохранение изменений
    console.log('Сохранено:', { name, description });
    navigate(-1);
  };

  const handleLogout = () => {
    // TODO: Выход из аккаунта
    console.log('Выход из аккаунта');
    // Можно добавить очистку данных и редирект на главную
    navigate('/');
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



