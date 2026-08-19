import { PROVIDER, readCookie, handshakePage } from './_oauth.js';

const fail = (res, message, code = 'auth_failed') =>
  res
    .status(200)
    .setHeader('Content-Type', 'text/html; charset=utf-8')
    .send(handshakePage('error', { provider: PROVIDER, error: message, errorCode: code }));

/** Step 2: swap GitHub's code for an access token and pass it to the CMS. */
export default async function handler(req, res) {
  const { code, state } = req.query;
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return fail(res, 'OAuth credentials are not set on this deployment.', 'misconfigured');
  }
  if (!code || !state || state !== readCookie(req.headers.cookie, 'csrf-token')) {
    return fail(res, 'Invalid or expired login attempt. Please try again.', 'bad_state');
  }

  // The cookie is single-use.
  res.setHeader('Set-Cookie', 'csrf-token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax; Secure');

  let token;
  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
    });
    const data = await response.json();
    if (data.error) return fail(res, data.error_description || data.error, data.error);
    token = data.access_token;
  } catch (err) {
    return fail(res, `Could not reach GitHub: ${err.message}`, 'network_error');
  }

  if (!token) return fail(res, 'GitHub did not return an access token.', 'no_token');

  res
    .status(200)
    .setHeader('Content-Type', 'text/html; charset=utf-8')
    .send(handshakePage('success', { provider: PROVIDER, token }));
}
