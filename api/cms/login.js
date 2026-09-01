import { timingSafeEqual } from 'node:crypto';
import { COOKIE_NAME, createSession } from './_shared.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  const expected = process.env.ADMIN_PASSWORD || '';
  const supplied = String(req.body?.password || '');
  const a = Buffer.from(supplied);
  const b = Buffer.from(expected);
  const valid = expected && a.length === b.length && timingSafeEqual(a, b);
  if (!valid) return res.status(401).json({ error: 'Incorrect password.' });

  try {
    const token = createSession();
    res.setHeader('Set-Cookie',
      COOKIE_NAME + '=' + token + '; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800'
    );
    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
