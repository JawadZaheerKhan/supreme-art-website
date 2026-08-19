# Supreme Art — Factory Website

Static site for Supreme Art, deployed on Vercel. Everything written on the site
is edited through a CMS at **https://www.supremeart.pk/admin** — you should not
need to touch the code to change wording, photos, prices, job listings or news.

## Editing the website

1. Go to **https://www.supremeart.pk/admin**
2. Sign in with GitHub (you need to be a collaborator on this repo)
3. Pick a section in the sidebar, make your change, press **Publish**

The change is committed to `main` and Vercel redeploys automatically — the site
is usually updated about a minute later. It works fine on a phone.

The sidebar has one entry per page, plus **Shared — menu, footer & contact** for
things that appear everywhere: the top menu, the footer, the email/phone/address,
the four capability cards and the factory gallery. Change those once and every
page updates.

### Photos

Any photo box on the site can be filled from the CMS. Where a photo has not been
set yet, the site shows a grey placeholder with a 📷 caption instead — that is
what most of the photo slots currently show.

The `images/` folder already contains factory and product photography that is
ready to use; it all appears in the CMS image picker, and anything you upload
joins it there.

## Structure

```
content/            the words on the site, as JSON — what the CMS edits
  site.json           shared menu, footer, contact details, capabilities, gallery
  index.json          one file per page…
templates/          page templates with {{ placeholders }}
  partials/           header, footer and other repeated blocks
static/             files copied to the site as-is
  admin/              the CMS (Sveltia) and its config
  images/             photography; also the CMS upload folder
api/                GitHub sign-in for the CMS (Vercel serverless functions)
build.js            merges content into the templates → dist/
dist/               build output; generated, not committed
```

`build.js` has no dependencies — the whole build is `node build.js`.

## Local development

```sh
npm run dev      # builds, then serves dist/ at http://localhost:3000
npm run build    # build only
```

Edit files in `content/` and `templates/`, then rebuild. **Don't edit anything in
`dist/`** — it is deleted and regenerated on every build.

A misspelled placeholder fails the build with a message naming the file and the
token, rather than quietly shipping a page with a blank section.

### Template syntax

| | |
| --- | --- |
| `{{ a.b }}` | insert a value (HTML-escaped) |
| `{{& a.b }}` | same, but line breaks become `<br />` |
| `{{{ a.b }}}` | insert raw HTML |
| `{{> name }}` | include `templates/partials/name.html` |
| `{{#if x}}…{{else}}…{{/if}}` | conditional |
| `{{#each list}}…{{/each}}` | repeat for each item |
| `{{#with obj}}…{{/with}}` | work inside an object |

Inside `#each`, `{{ . }}` is the item itself, `{{ @n }}` its 1-based position and
`{{ @num }}` the same zero-padded (`01`, `02`).

Each `templates/<name>.html` is rendered against `content/<name>.json` (available
as `page`) plus `content/site.json` (available as `site`).

## Deployment

Vercel runs `node build.js` and serves `dist/` (see `vercel.json`). Pushes to
`main` deploy to production.

### Required Vercel environment variables

| Variable | Value |
| --- | --- |
| `GITHUB_CLIENT_ID` | From the GitHub OAuth app |
| `GITHUB_CLIENT_SECRET` | From the GitHub OAuth app |
| `ALLOWED_DOMAINS` | `supremeart.pk` (comma-separated; controls which origins may receive a sign-in token) |

The OAuth app lives at GitHub → Settings → Developer settings → OAuth Apps, with
its callback URL set to `https://www.supremeart.pk/api/callback`.

## Custom domain

In the Vercel project → **Settings → Domains** → add the domain, then set the DNS
records Vercel shows at your registrar (A record `76.76.21.21` for the apex, or a
CNAME for `www`). SSL is automatic.
