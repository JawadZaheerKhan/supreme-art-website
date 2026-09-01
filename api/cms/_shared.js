import { createHmac, timingSafeEqual } from 'node:crypto';

export const REPO_OWNER = 'JawadZaheerKhan';
export const REPO_NAME = 'supreme-art-website';
export const REPO_BRANCH = 'main';
export const COOKIE_NAME = 'supreme_cms_session';
export const PAGES = new Set([
  'site', 'index', 'about', 'company-profile', 'products',
  'process', 'quality', 'careers', 'contact'
]);

const secret = () => process.env.ADMIN_SECRET || '';

function signature(value) {
  return createHmac('sha256', secret()).update(value).digest('base64url');
}

export function createSession() {
  if (!secret()) throw new Error('ADMIN_SECRET is not configured.');
  const payload = Buffer.from(JSON.stringify({
    expires: Date.now() + 8 * 60 * 60 * 1000
  })).toString('base64url');
  return payload + '.' + signature(payload);
}

export function validSession(req) {
  if (!secret()) return false;
  const cookies = Object.fromEntries(
    (req.headers.cookie || '').split(';').map(part => {
      const index = part.indexOf('=');
      return index < 0 ? ['', ''] : [part.slice(0, index).trim(), part.slice(index + 1)];
    })
  );
  const token = cookies[COOKIE_NAME];
  if (!token) return false;
  const [payload, supplied] = token.split('.');
  if (!payload || !supplied) return false;
  const expected = signature(payload);
  const a = Buffer.from(supplied);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString()).expires > Date.now();
  } catch {
    return false;
  }
}

export function requireSession(req, res) {
  if (validSession(req)) return true;
  res.status(401).json({ error: 'Please sign in again.' });
  return false;
}

export async function github(path, options = {}) {
  const token = process.env.CMS_GITHUB_TOKEN;
  if (!token) throw new Error('CMS_GITHUB_TOKEN is not configured.');
  const response = await fetch('https://api.github.com' + path, {
    ...options,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: 'Bearer ' + token,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'Supreme-Art-CMS',
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'GitHub request failed (' + response.status + ').');
  }
  return data;
}

export const repoPath = path =>
  '/repos/' + REPO_OWNER + '/' + REPO_NAME + '/contents/' + path;
