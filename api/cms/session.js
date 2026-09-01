import { validSession } from './_shared.js';

export default function handler(req, res) {
  res.status(validSession(req) ? 200 : 401).json({ authenticated: validSession(req) });
}
