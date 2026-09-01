import { randomUUID } from 'node:crypto';
import { REPO_BRANCH, github, repoPath, requireSession } from './_shared.js';

const types = new Map([
  ['image/jpeg', 'jpg'], ['image/png', 'png'], ['image/webp', 'webp'], ['image/gif', 'gif']
]);

export default async function handler(req, res) {
  if (!requireSession(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });

  const mime = String(req.body?.type || '');
  const base64 = String(req.body?.base64 || '').replace(/^data:[^;]+;base64,/, '');
  const ext = types.get(mime);
  if (!ext || !base64) return res.status(400).json({ error: 'Choose a JPG, PNG, WebP, or GIF image.' });
  const bytes = Buffer.from(base64, 'base64');
  if (bytes.length > 4 * 1024 * 1024) {
    return res.status(413).json({ error: 'Please choose an image smaller than 4 MB.' });
  }

  const path = 'static/uploads/cms-' + Date.now() + '-' + randomUUID().slice(0, 8) + '.' + ext;
  try {
    await github(repoPath(path), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'CMS: Upload image',
        content: bytes.toString('base64'),
        branch: REPO_BRANCH
      })
    });
    return res.status(200).json({ url: '/' + path.replace(/^static\//, '') });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
