This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

For fast design and CSS work, use the local dev server as the source of truth while iterating:

```bash
npm run dev -- --hostname 127.0.0.1 --port 61181 --webpack
```

Open `http://127.0.0.1:61181/` and make changes locally until the page looks right. The public production site at `estate.nakanodigital.com` runs from the last deployed production build, so it will not update from local CSS changes until the changes are committed, pushed, pulled by production, rebuilt, and restarted.

Typical workflow:

```bash
npm run build
git status --short
git add <changed site files>
git commit -m "Describe the site update"
git push origin <branch>
```

If production is tracking that branch, the pushed commit can be deployed. If production tracks another branch, merge or pull the pushed changes there first.

## Directus CMS

This app uses an existing self-hosted Directus instance as the CMS for one tenant. Configure:

```bash
DIRECTUS_URL=https://cms.example.com
DIRECTUS_TOKEN=directus-static-token
DIRECTUS_TENANT_ID=estate-planning
DIRECTUS_CACHE_SECONDS=300
```

If you are running this inside the wider Nakano stack, the app also accepts the estate-scoped environment names:

```bash
ESTATE_DIRECTUS_URL=https://cms.example.com
ESTATE_DIRECTUS_ADMIN_TOKEN=directus-static-token
```

Bootstrap the Directus collections and starter tenant/page/navigation records:

```bash
npm run cms:bootstrap
```

The bootstrap is idempotent. It creates `tenants`, `site_pages`, `page_sections`, and `navigation_items` if missing, then upserts the current tenant starter content. If Directus is unavailable or records are incomplete, the frontend falls back to local content.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
