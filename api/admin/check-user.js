// Временный endpoint для диагностики пользователя
const { kv } = require('@vercel/kv');

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
    
    // Получаем профиль
    const profile = await kv.get(`user:${normalizedEmail}`);
    
    if (!profile) {
      res.status(404).json({ 
        error: 'User not found',
        email: normalizedEmail,
        hasProfile: false
      });
      return;
    }

    // Возвращаем информацию о профиле (без пароля)
    const { passwordHash, ...profileWithoutPassword } = profile;
    
    res.status(200).json({ 
      ok: true,
      email: normalizedEmail,
      hasProfile: true,
      hasPasswordHash: !!passwordHash,
      passwordHashLength: passwordHash?.length || 0,
      profile: profileWithoutPassword
    });
  } catch (e) {
    console.error('Check user error:', e);
    res.status(500).json({ error: 'Failed to check user' });
  }
};


