const { kv } = require('@vercel/kv');

// POST - удалить публикацию
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { publicationId } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    if (!publicationId) {
      res.status(400).json({ error: 'Publication ID is required' });
      return;
    }

    // Получаем все публикации
    const publications = await kv.get('publications:all') || [];
    
    // Удаляем публикацию
    const filtered = publications.filter(pub => pub.id !== publicationId);
    
    // Сохраняем обратно
    await kv.set('publications:all', filtered);

    res.status(200).json({ ok: true });
  } catch (e) {
    console.error('Delete publication error:', e);
    res.status(500).json({ error: 'Failed to delete publication' });
  }
};


