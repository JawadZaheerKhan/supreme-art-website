# Supreme Art — Factory Website

A simple static marketing site for Supreme Art, deployed on Vercel.

## Structure

- `index.html` — single-page site (hero, services, about, contact)
- `styles.css` — styling

No build step. It's plain static HTML/CSS, which Vercel serves directly.

## Local preview

Open `index.html` in a browser, or run a tiny local server:

```sh
python3 -m http.server 3000
# then visit http://localhost:3000
```

## Deploy to Vercel (free / Hobby plan)

Either method works:

**A. Via GitHub (recommended — auto-deploys on push)**
1. Push this folder to a GitHub repo.
2. In Vercel → Add New → Project → import the repo.
3. Framework preset: **Other**. No build command, output dir = root.
4. Deploy.

**B. Via Vercel CLI**
```sh
npm i -g vercel
vercel        # first run links/creates the project
vercel --prod # promote to production
```

## Custom domain

In the Vercel project → **Settings → Domains** → add your domain, then set the
DNS records Vercel shows you at your registrar (A record `76.76.21.21` for the
apex, or a CNAME for `www`). SSL is automatic.
