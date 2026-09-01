import { COOKIE_NAME } from './_shared.js';

export default function handler(req, res) {
  res.setHeader('Set-Cookie',
    COOKIE_NAME + '=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0'
  );
  res.status(200).json({ ok: true });
}
