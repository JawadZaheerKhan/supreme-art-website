import { PAGES, REPO_BRANCH, github, repoPath, requireSession } from './_shared.js';

export default async function handler(req, res) {
  if (!requireSession(req, res)) return;
  const page = String(req.query.page || '');
  if (!PAGES.has(page)) return res.status(400).json({ error: 'Unknown page.' });
  const path = 'content/' + page + '.json';

  try {
    if (req.method === 'GET') {
      const file = await github(repoPath(path) + '?ref=' + encodeURIComponent(REPO_BRANCH));
      const content = JSON.parse(Buffer.from(file.content, 'base64').toString('utf8'));
      return res.status(200).json({ content, sha: file.sha });
    }

    if (req.method === 'PUT') {
      const content = req.body?.content;
      const sha = String(req.body?.sha || '');
      if (!content || typeof content !== 'object' || Array.isArray(content) || !sha) {
        return res.status(400).json({ error: 'Invalid content update.' });
      }
      const formatted = JSON.stringify(content, null, 2) + '\n';
      if (Buffer.byteLength(formatted) > 250000) {
        return res.status(413).json({ error: 'This page is too large to save.' });
      }
      const saved = await github(repoPath(path), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'CMS: Update ' + page,
          content: Buffer.from(formatted).toString('base64'),
          sha,
          branch: REPO_BRANCH
        })
      });
      return res.status(200).json({ ok: true, sha: saved.content.sha });
    }

    return res.status(405).json({ error: 'Method not allowed.' });
  } catch (error) {
    const conflict = /sha|does not match|conflict/i.test(error.message);
    return res.status(conflict ? 409 : 500).json({ error: error.message });
  }
}
