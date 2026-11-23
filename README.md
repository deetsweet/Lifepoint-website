# Lifepoint Church website

Source for lifepoint.org.au (currently a test build at deetsweet.github.io/Lifepoint-website).

## How it works
- Pages live in `src/` (one file per page, e.g. `src/sundays.njk`).
- Shared details (service times, contact, menus, footer) are in `src/_data/site.json`. Change them once and every page updates.
- Every photo on the site is listed in `src/_data/images.json`. Image files go in `src/assets/img/`.
- Styles are in `src/assets/css/site.css`.
- Each push to `main` rebuilds the site and publishes it automatically (see `.github/workflows/deploy.yml`).

## Building locally
```
npm install
npx @11ty/eleventy --serve
```

## Moving to lifepoint.org.au
1. Set `PATH_PREFIX` to `/` in `eleventy.config.js`.
2. Add `src/CNAME` containing `www.lifepoint.org.au`.
3. Point the domain's DNS (Crazy Domains) at GitHub Pages.
