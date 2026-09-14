# ZAYA CODE HUB

Next.js app for [zayacodehub.in](https://www.zayacodehub.in) — internships, coding practice, magazine, and admin portal.

## Local development

```bash
npm install
cp .env.example .env.local
# Add your Supabase keys to .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy on Vercel

1. Import [rahulyadav54/ZAYA-COMPANY](https://github.com/rahulyadav54/ZAYA-COMPANY) on Vercel
2. Add environment variables (Project → Settings → Environment Variables):

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Public Supabase key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Intern account creation & login recovery |
| `RESEND_API_KEY` | Optional | Transactional email |
| `RAZORPAY_KEY_ID` | Optional | Payments |
| `RAZORPAY_KEY_SECRET` | Optional | Payments |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Optional | Client-side Razorpay |

3. Redeploy after adding env vars

**Note:** `SUPABASE_SERVICE_ROLE_KEY` is required for intern login and admin acceptance flow. Without it, interns cannot be created or repaired on login.

## Build

```bash
npm run build
npm start
```
