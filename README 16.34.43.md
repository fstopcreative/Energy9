# Energy Claim Landing Page

A production-ready React and Vercel lead capture system for energy claim enquiries. Form submissions are posted to a Vercel API route, validated server-side, and forwarded securely to a Microsoft Power Automate webhook.

## Local Development

```bash
npm install
npm run dev
```

Create `.env.local` with:

```bash
POWER_AUTOMATE_URL="https://your-power-automate-webhook-url"
```

## Deploying To Vercel

1. Import the project into Vercel.
2. Add `POWER_AUTOMATE_URL` as a project environment variable.
3. Deploy.

The frontend submits to `/api/submit-claim`. The API route accepts `POST` requests only and forwards this payload to Power Automate:

```json
{
  "fullName": "Example Name",
  "email": "name@example.com",
  "phone": "07123456789",
  "postcode": "SW1A 1AA",
  "address": "Optional address",
  "claimType": "Overcharged energy bill",
  "message": "Optional message",
  "consent": true,
  "createdAt": "2026-05-05T12:00:00.000Z",
  "source": "Website"
}
```
