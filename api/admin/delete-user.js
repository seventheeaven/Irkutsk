const { kv } = require('@vercel/kv');

// Удаление конкретного пользователя по email
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { email } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    // Нормализуем email
    const normalizedEmail = email.toLowerCase().trim();

    // Получаем профиль, чтобы узнать username
    const profile = await kv.get(`user:${normalizedEmail}`);
    
    if (profile && profile.username) {
      // Удаляем индекс username
      await kv.del(`username:${profile.username}`);
    }

    // Удаляем профиль пользователя
    await kv.del(`user:${normalizedEmail}`);

    res.status(200).json({ 
      ok: true, 
      message: `User ${normalizedEmail} deleted successfully` 
    });
  } catch (e) {
    console.error('Delete user error:', e);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};


