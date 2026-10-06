# Home Cleaning & Co

Astro + React marketing site and booking flow for a home cleaning business.

## Local Setup

1. Install dependencies:

```sh
npm install
```

2. Copy the example env file and fill in real values:

```sh
copy .env.production.example .env
```

3. Start the app:

```sh
npm run dev
```

## Required Environment Variables

- `DATABASE_URL`: Neon/Postgres connection string used by pricing, places, bookings, and availability APIs.
- `RESEND_API_KEY`: Resend API key for lead emails.
- `LEAD_NOTIFICATION_EMAIL`: Inbox that receives quote requests.
- `RESEND_FROM_EMAIL`: Verified sender used by Resend.

## Deploying To Vercel

1. Push this folder to a GitHub repository.
2. Import the repo into Vercel.
3. Set the four environment variables above in the Vercel project settings.
4. Deploy.

The project already includes:

- Astro Vercel adapter
- `output: "server"` for API routes
- `vercel.json` with `framework: "astro"`

## Build Commands

```sh
npm run build
npm run preview
```

## Promotional landing page

`/landing` contains the cleaning voucher landing page. Source: `src/pages/landing.astro`; dedicated styles, script, and photos: `public/landing-assets/`. The homepage is unchanged. The form uses the existing `/api/send-email` endpoint and the Resend environment variables documented above. A successful request sends a lead; it does not confirm a booking or automatically issue a voucher.
