const { kv } = require('@vercel/kv');
const crypto = require('crypto');

function sha256(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

function getBaseUrl(req) {
  const proto = (req.headers['x-forwarded-proto'] || 'https');
  const host = (req.headers['x-forwarded-host'] || req.headers.host);
  return `${proto}://${host}`;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { email, mode } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    if (typeof email !== 'string' || !email.includes('@')) {
      res.status(400).json({ error: 'Invalid email' });
      return;
    }

    // Используем Brevo (бывший Sendinblue) API
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      console.error('BREVO_API_KEY is missing');
      res.status(500).json({ error: 'Missing BREVO_API_KEY env var' });
      return;
    }

    // Нормализуем email (нижний регистр, без пробелов)
    const normalizedEmail = email.toLowerCase().trim();
    
    console.log('Request received:', { originalEmail: email, normalizedEmail, mode });
    
    // Определяем режим (login или register)
    const isLogin = mode === 'login';
    
    // Для регистрации не проверяем существование пользователя
    // Magic link используется только для регистрации

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = sha256(token);

    // Store token hash -> email with TTL 15 minutes (используем нормализованный email)
    await kv.set(`magiclink:${tokenHash}`, { email: normalizedEmail, mode: mode || 'register' }, { ex: 60 * 15 });

    const baseUrl = getBaseUrl(req);
    const link = `${baseUrl}/auth/callback?token=${encodeURIComponent(token)}`;

    const subject = isLogin ? 'Вход в SYUDA' : 'Регистрация в SYUDA';
    const actionText = isLogin ? 'Войти' : 'Зарегистрироваться';
    const description = isLogin 
      ? 'Нажмите на кнопку ниже, чтобы войти в свой аккаунт. Ссылка действует 15 минут.'
      : 'Нажмите на кнопку ниже, чтобы завершить регистрацию. Ссылка действует 15 минут.';

    console.log('Sending email to:', normalizedEmail);
    
    // Используем Brevo API (бывший Sendinblue)
    const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        sender: {
          name: 'SYUDA',
          email: 'noreply@suydacity.ru' // Email отправителя с нового домена
        },
        to: [
          {
            email: normalizedEmail
          }
        ],
        subject: subject,
        htmlContent: `
          <div style="font-family: -apple-system,BlinkMacSystemFont,system-ui,Segoe UI,Roboto,Arial,sans-serif; line-height: 1.5;">
            <h2 style="margin:0 0 12px 0;">${subject}</h2>
            <p style="margin:0 0 16px 0;">${description}</p>
            <p style="margin:0 0 16px 0;">
              <a href="${link}" style="display:inline-block;padding:12px 18px;background:#111;color:#fff;border-radius:12px;text-decoration:none;">
                ${actionText}
              </a>
            </p>
            <p style="margin:0;color:#888;font-size:12px;">Если вы не запрашивали ${isLogin ? 'вход' : 'регистрацию'} — просто проигнорируйте это письмо.</p>
          </div>
        `,
      }),
    });

    const brevoResult = await brevoResponse.json();
    console.log('Brevo API response:', brevoResult);

    if (!brevoResponse.ok) {
      console.error('Brevo API error:', brevoResult);
      throw new Error(brevoResult.message || 'Failed to send email via Brevo');
    }

    res.status(200).json({ ok: true });
  } catch (e) {
    console.error('Magic link error:', e);
    const errorMessage = e?.message || 'Failed to send magic link';
    res.status(500).json({ error: errorMessage });
  }
};
