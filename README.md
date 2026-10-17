# ACM Student Chapter · DIT Pimpri

A responsive React/Vite website for the ACM Student Chapter at Dr. D. Y. Patil Institute of Technology, Pimpri. The static frontend is deployed on GitHub Pages. The `/register` page submits the confirmed eight-field application to a separate Vercel serverless API, which inserts it into Supabase PostgreSQL. The existing Google Form remains available as a fallback.

## Project structure

- `src/App.tsx` contains the homepage.
- `src/components/RegistrationPage.tsx` contains the registration page and client-side validation.
- `src/data/content.ts` contains factual homepage content and the Google Form fallback URL.
- `api/applications.js` is the Vercel `POST /api/applications` entry point.
- `api/lib/` contains application validation, request handling, Upstash rate limiting, and the server-only Supabase adapter.
- `supabase/schema.sql` creates the applications table and its restricted permissions.
- `public/videos/hero-background.mp4` is the supplied homepage hero video.

The application fields are Name, Contact Number, Email, Roll No., Gender, Year, Domain, and optional Experience or prior work. Resume upload is not included. The database generates `id` and `created_at`; `status` defaults to `pending`.

## Supabase setup

Before deploying the API, open the intended Supabase project’s SQL Editor and run [`supabase/schema.sql`](supabase/schema.sql). It creates `public.applications`, enables RLS, leaves browser roles without table access, and grants insert permission to `service_role`. The API does not send `id`, `created_at`, or `status` in its insert.

Make `public.applications` available to the Supabase Data API in the project’s API settings if it is not already exposed. Keep the table out of browser-facing privileges: do not grant access to `anon` or `authenticated`, and do not add public policies. The Vercel API uses the server-only secret key; never put it in a `VITE_` variable or frontend build.

## Local development

The registration page calls `${VITE_API_BASE_URL}/api/applications`. `VITE_API_BASE_URL` must be an API origin such as `http://localhost:3000` or the deployed Vercel origin, without `/api/applications`.

1. Copy `.env.local.example` to `.env.local` and fill it with values for a non-production Supabase project and an Upstash database. Do not commit `.env.local`.
2. Start the Vercel API locally with `vercel dev --listen 3000`.
3. In another terminal, run `npm run dev` and open the local Vite URL. The example allows `http://localhost:5173` and points the browser to the local Vercel API at port 3000.

Run `npm test` for validation, handler, mocked Supabase, and mocked Upstash tests. Run `npm run build` for the type-check and production frontend build. Automated tests do not require live Supabase or Upstash credentials.

## Vercel API configuration

Set the following backend variables in Vercel Project Settings → Environment Variables for the environments you use:

| Variable | Purpose |
| --- | --- |
| `SUPABASE_URL` | Project URL from the Supabase project’s API settings. |
| `SUPABASE_SECRET_KEY` | Server-only Supabase secret key from the project’s API keys page. Treat as a credential; never expose it to the frontend. |
| `ALLOWED_ORIGINS` | Comma-separated exact browser origins. For the current GitHub Pages project site, use `https://localvariable-dev.github.io` (no repository path); add any custom domain origin if configured. |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL used by the shared rate limiter. |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash REST token; secret. |

The handler validates the application, limits the request body to 8 KiB, checks CORS origins, and uses the durable rate limiter before attempting the database insert. Missing or unavailable backend services fail closed. No applicant content or credentials are logged.

## Deployment

1. Apply `supabase/schema.sql` in the target Supabase project and confirm the table is exposed to the Data API while browser roles remain denied.
2. Add the Vercel environment variables listed above. Set them for the intended deployment environments, then deploy the repository through the existing Vercel Git integration.
3. In GitHub repository Actions variables, keep `VITE_API_BASE_URL` set to the Vercel API origin only. The existing Pages workflow uses this public URL at build time; it is not a credential.
4. Ensure Vercel `ALLOWED_ORIGINS` contains the exact GitHub Pages origin (and any intentionally used custom-domain origin), then redeploy if configuration changed.
5. Verify with a synthetic application in a non-production/test Supabase project. Confirm the API returns HTTP 201 only after insertion and that one row appears in `public.applications` with the expected field mapping, database-generated `id`/`created_at`, and `pending` status. Remove the synthetic row after verification. Do not use real applicant data for a test.

GitHub Pages uses the repository’s `404.html` fallback for direct `/register` visits and refreshes. The API remains on its separate Vercel origin at `POST /api/applications`.

## Verification status

Unit tests use a mocked Supabase client and cannot establish that the owner’s Supabase project, Vercel variables, Data API exposure, or production deployment are configured correctly. The production flow is not verified until a synthetic test insert is confirmed in the intended Supabase table.
