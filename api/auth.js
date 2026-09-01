import { randomUUID } from 'node:crypto';

/** Step 1 of the CMS login: bounce the popup to GitHub's consent screen. */
export default function handler(req, res) {
  const clientId = process.env.GITHUB_CLIENT_ID;

  if (!clientId) {
    return res.status(500).send('GITHUB_CLIENT_ID is not set on this deployment.');
  }

  // CSRF token: handed to GitHub as `state` and stashed in a cookie so the
  // callback can prove the response belongs to a login we started.
  const csrf = randomUUID();

  res.setHeader(
    'Set-Cookie',
    `csrf-token=${csrf}; HttpOnly; Path=/; Max-Age=600; SameSite=Lax; Secure`
  );

  const params = new URLSearchParams({
    client_id: clientId,
    scope: 'repo,user',
    state: csrf,
  });

  res.redirect(302, `https://github.com/login/oauth/authorize?${params}`);
}
