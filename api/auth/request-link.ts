import { kv } from '@vercel/kv';
import { Resend } from 'resend';
import crypto from 'crypto';

function sha256(input: string) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

function getBaseUrl(req: any) {
  const proto = (req.headers['x-forwarded-proto'] || 'https') as string;
  const host = (req.headers['x-forwarded-host'] || req.headers.host) as string;
  return `${proto}://${host}`;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { email } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    if (typeof email !== 'string' || !email.includes('@')) {
      res.status(400).json({ error: 'Invalid email' });
      return;
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY is missing');
      res.status(500).json({ error: 'Missing RESEND_API_KEY env var' });
      return;
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = sha256(token);

    // Store token hash -> email with TTL 15 minutes
    await kv.set(`magiclink:${tokenHash}`, { email }, { ex: 60 * 15 });

    const baseUrl = getBaseUrl(req);
    const link = `${baseUrl}/my-collections?token=${encodeURIComponent(token)}`;

    const resend = new Resend(apiKey);

    await resend.emails.send({
      from: 'SYUDA <onboarding@resend.dev>',
      to: [email],
      subject: 'Вход в SYUDA',
      html: `
        <div style="font-family: -apple-system,BlinkMacSystemFont,system-ui,Segoe UI,Roboto,Arial,sans-serif; line-height: 1.5;">
          <h2 style="margin:0 0 12px 0;">Вход в SYUDA</h2>
          <p style="margin:0 0 16px 0;">Нажмите на кнопку ниже, чтобы войти. Ссылка действует 15 минут.</p>
          <p style="margin:0 0 16px 0;">
            <a href="${link}" style="display:inline-block;padding:12px 18px;background:#111;color:#fff;border-radius:12px;text-decoration:none;">
              Войти
            </a>
          </p>
          <p style="margin:0;color:#888;font-size:12px;">Если вы не запрашивали вход — просто проигнорируйте это письмо.</p>
        </div>
      `,
    });

    res.status(200).json({ ok: true });
  } catch (e: any) {
    console.error('Magic link error:', e);
    const errorMessage = e?.message || 'Failed to send magic link';
    res.status(500).json({ error: errorMessage });
  }
}


