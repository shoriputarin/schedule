# schedule

This repository was initialized via CLI.

## Preview indexing control

- In Vercel preview deployments (`VERCEL_ENV=preview`), middleware sets `X-Robots-Tag: noindex, nofollow` for all routes to prevent indexing.
- Production keeps normal indexing; `next-sitemap` generates `robots.txt` and `sitemap.xml` in `public/`.
- Ensure `NEXT_PUBLIC_SITE_URL` is configured in GitHub Variables for correct sitemap URLs.
