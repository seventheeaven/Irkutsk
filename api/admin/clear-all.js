const { kv } = require('@vercel/kv');

// ОПАСНО: Этот endpoint удаляет ВСЕ данные из KV
// Используйте только для очистки тестовых данных!

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Защита: нужен секретный ключ для безопасности
  const { secret } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  
  // Установите свой секретный ключ здесь (или через env переменную)
  const REQUIRED_SECRET = process.env.CLEAR_SECRET || 'CLEAR_ALL_DATA_2024';
  
  if (secret !== REQUIRED_SECRET) {
    res.status(401).json({ error: 'Unauthorized. Provide correct secret.' });
    return;
  }

  try {
    console.log('⚠️ CLEARING ALL DATA FROM KV...');
    
    // В Vercel KV нет метода для получения всех ключей
    // Но мы можем удалить известные ключи
    
    // Удаляем все публикации
    await kv.del('publications:all');
    console.log('✓ Cleared publications');
    
    // Примечание: для удаления всех пользователей нужно знать их email
    // Или использовать Vercel Dashboard
    
    res.status(200).json({ 
      ok: true, 
      message: 'Publications cleared. To clear users, use Vercel Dashboard or provide email list.',
      note: 'User data requires manual deletion via Vercel Dashboard or by providing email addresses'
    });
  } catch (e) {
    console.error('Clear all error:', e);
    res.status(500).json({ error: 'Failed to clear data' });
  }
};


