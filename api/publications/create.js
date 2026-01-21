const { kv } = require('@vercel/kv');

// POST - создать новую публикацию
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const publication = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    if (!publication.id || !publication.name || !publication.imageUrls) {
      res.status(400).json({ error: 'Invalid publication data' });
      return;
    }

    // Получаем все публикации
    const publications = await kv.get('publications:all') || [];
    
    // Добавляем новую публикацию
    publications.push(publication);
    
    // Сохраняем обратно
    await kv.set('publications:all', publications);

    res.status(200).json({ ok: true, publication });
  } catch (e) {
    console.error('Create publication error:', e);
    res.status(500).json({ error: 'Failed to create publication' });
  }
};

