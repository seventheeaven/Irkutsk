const { kv } = require('@vercel/kv');

// Проверка уникальности username
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { username, currentEmail } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    if (!username) {
      res.status(400).json({ error: 'Username is required' });
      return;
    }

    const normalizedUsername = username.startsWith('@') ? username : `@${username}`;
    const existingEmail = await kv.get(`username:${normalizedUsername}`);

    // Если username занят другим пользователем
    if (existingEmail && existingEmail !== currentEmail) {
      res.status(200).json({ ok: true, available: false });
      return;
    }

    res.status(200).json({ ok: true, available: true });
  } catch (e) {
    console.error('Check username error:', e);
    res.status(500).json({ error: 'Failed to check username' });
  }
};

