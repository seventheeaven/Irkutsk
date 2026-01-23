const { kv } = require('@vercel/kv');
const crypto = require('crypto');

function sha256(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

// POST - проверка email и пароля для входа
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { email, password } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email и пароль обязательны' });
      return;
    }

    // Нормализуем email
    const normalizedEmail = email.toLowerCase().trim();
    
    console.log('Login attempt:', { email: normalizedEmail, passwordLength: password?.length });
    
    // Получаем профиль пользователя
    const profile = await kv.get(`user:${normalizedEmail}`);
    
    if (!profile) {
      console.log('Login failed: Profile not found', { email: normalizedEmail });
      res.status(401).json({ error: 'Неверный email или пароль' });
      return;
    }

    // Проверяем пароль
    const passwordHash = sha256(password);
    console.log('Password check:', { 
      providedHash: passwordHash.substring(0, 10) + '...',
      storedHash: profile.passwordHash?.substring(0, 10) + '...',
      match: profile.passwordHash === passwordHash
    });
    
    if (!profile.passwordHash) {
      console.log('Login failed: No password hash in profile');
      res.status(401).json({ error: 'Неверный email или пароль' });
      return;
    }
    
    if (profile.passwordHash !== passwordHash) {
      console.log('Login failed: Password hash mismatch');
      res.status(401).json({ error: 'Неверный email или пароль' });
      return;
    }
    
    console.log('Login successful:', { email: normalizedEmail });

    // Возвращаем профиль (без пароля)
    const { passwordHash: _, ...profileWithoutPassword } = profile;
    res.status(200).json({ ok: true, profile: profileWithoutPassword });
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ error: 'Ошибка при входе' });
  }
};

