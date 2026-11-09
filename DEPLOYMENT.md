# Deployment (Vercel)

There are two Vercel projects, both built from this one repository.

| Project | Root directory | Domain |
|---------|----------------|--------|
| `craft-web`   | `web`   | `{{DOMAIN}}` (+ `www.` redirect) |
| `craft-admin` | `admin` | `admin.{{DOMAIN}}` |

For each project: **New Project → import the repo → set "Root Directory"**. Vercel detects Next.js and the npm workspaces automatically, so the default install and build commands work.

## Environment variables

| Variable | web | admin | Notes |
|----------|:---:|:-----:|-------|
| `MONGODB_URI` | ✔ | ✔ | The same Atlas cluster/database for both |
| `CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET` | ✔ | ✔ | Same account |
| `SITE_URL` | ✔ | ✔ | `https://{{DOMAIN}}` (no trailing slash) |
| `ADMIN_URL` | ✔ | ✔ | `https://admin.{{DOMAIN}}` |
| `REVALIDATE_SECRET` | ✔ | ✔ | **Must match.** `openssl rand -base64 32` |
| `NEXTAUTH_SECRET` | | ✔ | Signs admin session cookies. `openssl rand -base64 32` |
| `CRON_SECRET` | | ✔ | Protects `/api/cron/publish` (Vercel sends it automatically) |
| `DOWNLOAD_SECRET` | optional | | Signs email-gated download links; defaults to `REVALIDATE_SECRET` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | | | Only needed where you run `npm run seed` |

Never commit real values. Only the `.env.example` files are tracked.

## Order of operations

1. Create the Atlas cluster. Under Network Access, allow Vercel (`0.0.0.0/0` together with a strong DB password, or use Vercel's Atlas integration).
2. Run the seed once, from your machine, against the production `MONGODB_URI`:
   `MONGODB_URI=... ADMIN_EMAIL=... ADMIN_PASSWORD=... CLOUDINARY_...=... npm run seed`
3. Deploy `craft-web`, then `craft-admin`.
4. DNS: point `{{DOMAIN}}` at the web project and `admin.{{DOMAIN}}` (CNAME `cname.vercel-dns.com`) at the admin project.
5. Log in at `https://admin.{{DOMAIN}}`, then go to Settings to add GA4, Search Console, Pinterest verification and ads.txt.
6. Submit `https://{{DOMAIN}}/sitemap.xml` in Search Console. Validate a post URL in Pinterest's Rich Pins validator.

## Cloudinary notes

- Uploads are signed by `admin/api/cloudinary/sign`, and the browser uploads straight to Cloudinary. Files land in `craft-site/<folder>`.
- PDFs are uploaded as **raw** assets, so they're always deliverable, even with Cloudinary's "restrict PDF delivery" security default.
- The Media library uses the Cloudinary Search API. Search indexing can take a few seconds after an upload.

## Cron

`admin/vercel.json` runs `/api/cron/publish` hourly. It flips due scheduled posts to published and revalidates the site. Hobby plans allow daily crons only; if you're on Hobby, change the schedule to `0 6 * * *`. Pages still refresh hourly through ISR either way.
