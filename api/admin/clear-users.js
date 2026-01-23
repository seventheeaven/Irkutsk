const { kv } = require('@vercel/kv');

// ВРЕМЕННЫЙ ENDPOINT ДЛЯ ОЧИСТКИ ВСЕХ ПОЛЬЗОВАТЕЛЕЙ
// УДАЛИТЕ ЭТОТ ФАЙЛ ПОСЛЕ ИСПОЛЬЗОВАНИЯ!

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Получаем все ключи, начинающиеся с 'user:'
    // В Vercel KV нет прямого способа получить все ключи, поэтому нужно знать email
    // Или можно использовать паттерн, но это зависит от реализации
    
    // Альтернативный подход: используем список всех email из индекса username
    // Но проще всего - удалить вручную через Vercel Dashboard
    
    // Для автоматической очистки нужно знать все email
    // Но так как мы не храним список всех email, лучше очистить через Dashboard
    
    res.status(200).json({ 
      ok: true, 
      message: 'Для очистки используйте Vercel Dashboard или удалите пользователей вручную',
      instructions: [
        '1. Зайдите в Vercel Dashboard',
        '2. Откройте ваш проект',
        '3. Перейдите в Storage → KV',
        '4. Найдите и удалите все ключи, начинающиеся с "user:"',
        '5. Также удалите ключи, начинающиеся с "username:"',
        '6. И ключи "publications:all" если нужно очистить публикации'
      ]
    });
  } catch (e) {
    console.error('Clear users error:', e);
    res.status(500).json({ error: 'Failed to clear users' });
  }
};


