const { kv } = require('@vercel/kv');
const crypto = require('crypto');

function sha256(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { token } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    if (typeof token !== 'string' || token.length < 10) {
      res.status(400).json({ error: 'Invalid token' });
      return;
    }

    const tokenHash = sha256(token);
    const key = `magiclink:${tokenHash}`;
    const record = await kv.get(key);

    if (!record || !record.email) {
      res.status(401).json({ error: 'Token expired or invalid' });
      return;
    }

    // One-time use
    await kv.del(key);

    const email = String(record.email);
    const usernameBase = email.split('@')[0] || 'user';

    // Minimal profile (frontend stores it in localStorage)
    const profile = {
      name: usernameBase,
      username: `@${usernameBase}`,
      description: '',
      avatar: undefined,
      email,
    };

    res.status(200).json({ ok: true, profile });
  } catch (e) {
    console.error('Verify token error:', e);
    res.status(500).json({ error: 'Failed to verify token' });
  }
};
