# Gabvox business solution selector

Gabvox is a dependency-free static website for choosing among three business
solutions: Gabvox Automate, Gabvox Web Dev, and Automate Dev. The site is
generated as crawlable HTML pages so its industry, service, solution, and
resource content does not depend on client-side rendering.

## Local development

Requires Node.js 18 or newer. No package installation is required.

```sh
npm run build
npm run serve
```

Open <http://localhost:4173>. The build output is written to `dist/`.

## Content and deployment

- Update business positioning and page content in `src/site-data.js`.
- Update shared page markup and SEO metadata in `build.js`, shared navigation
  behavior in `src/app.js`, and responsive presentation in `src/styles.css`.
- Update the homepage-only business selector in `src/selector.js`; its
  recommendation data is included only on the homepage.
- The supplied transparent logo is kept in `src/assets/logo/` and served as
  optimized WebP, with a matching PNG favicon.
- Set `SITE_URL` to the canonical HTTPS origin before building for production.
  It is used for canonical tags, structured data, and `sitemap.xml`; the
  default `https://gabvox.com` should be changed if the production domain
  differs.
- Publish the contents of `dist/` to any static HTTPS host that serves
  directory `index.html` files. Configure the host/CDN to compress text assets
  and cache versioned static assets as appropriate for that platform.

The solution library describes proposed approaches, not completed client
projects or measured client outcomes. No CRM, booking, email, analytics, or
form integration is represented as connected. Confirm the production contact
path and any third-party integrations before adding those conversion flows.
No client-approved case studies or project screenshots were supplied, so
none are presented as completed work. Supabase Storage and YouTube are not
connected; approved project assets and real case-study details can be added
when they are available.
