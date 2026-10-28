# Issue Tracker

## Run locally

1. Copy `.env.example` to `.env`.
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to your Supabase project URL and public anon/publishable key.
3. Install dependencies and start Vite:

   ```sh
   npm install
   npm run dev
   ```

Never put a Supabase `service_role` or secret key in this frontend app.

## Deploy to Vercel

1. Push this project to a Git provider such as GitHub, then import the repository in Vercel. If the repository contains this app in a subfolder, set that folder as Vercel's **Root Directory**.
2. Use the Vite defaults:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install`
3. In Vercel **Project Settings → Environment Variables**, add:
   - `VITE_SUPABASE_URL` — the Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` — the Supabase anon or publishable key

   Add both for Production and Preview (and Development if using Vercel CLI), then redeploy.
4. After the first deployment, copy the production URL. In Supabase **Authentication → URL Configuration**, set **Site URL** to that URL and add it to the allowed redirect URLs. Add your Vercel preview URL pattern there too if you use preview deployments.

`vercel.json` rewrites app routes to `index.html`, so refreshing a route such as `/issues/123` works in the deployed single-page app.
