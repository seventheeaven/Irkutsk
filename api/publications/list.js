const { kv } = require('@vercel/kv');

// GET - получить все публикации
module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const publications = await kv.get('publications:all') || [];
    
    // Сортируем по дате создания (новые сначала)
    publications.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    res.status(200).json({ ok: true, publications });
  } catch (e) {
    console.error('Get publications error:', e);
    res.status(500).json({ error: 'Failed to get publications' });
  }
};


