const { kv } = require('@vercel/kv');

// GET - получить профиль пользователя по email
// POST - сохранить/обновить профиль пользователя
module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { email } = req.query;
      
      if (!email) {
        res.status(400).json({ error: 'Email is required' });
        return;
      }

      const profile = await kv.get(`user:${email}`);
      
      if (!profile) {
        res.status(404).json({ error: 'Profile not found' });
        return;
      }

      res.status(200).json({ ok: true, profile });
    } catch (e) {
      console.error('Get profile error:', e);
      res.status(500).json({ error: 'Failed to get profile' });
    }
  } else if (req.method === 'POST') {
    try {
      const { email, profile } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

      if (!email || !profile) {
        res.status(400).json({ error: 'Email and profile are required' });
        return;
      }

      // Получаем старый профиль, чтобы обновить индекс username
      const oldProfile = await kv.get(`user:${email}`);
      
      // Если username изменился, удаляем старый индекс
      if (oldProfile && oldProfile.username && oldProfile.username !== profile.username) {
        await kv.del(`username:${oldProfile.username}`);
      }

      // Сохраняем профиль
      await kv.set(`user:${email}`, profile);
      
      // Также сохраняем в индекс по username для проверки уникальности
      if (profile.username) {
        await kv.set(`username:${profile.username}`, email);
      }

      res.status(200).json({ ok: true });
    } catch (e) {
      console.error('Save profile error:', e);
      res.status(500).json({ error: 'Failed to save profile' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};

