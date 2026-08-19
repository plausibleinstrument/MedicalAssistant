# Dad's Medical Records

A private, invite-only web app for archiving and retrieving Dad's medical bills, prescriptions,
test reports, doctor's notes, and discharge summaries — searchable by date, doctor, type, and
condition (Cancer / UC / Diabetes / CKD) — plus an AI-assisted "prepare for a doctor visit" report.

## Stack (all free-tier)

- **Next.js 14** (App Router, TypeScript, Tailwind) — the app itself
- **Supabase** — Postgres database, Google-OAuth auth, and encrypted private file storage
- **Anthropic (Claude) API** — auto-classifies uploaded documents and generates doctor-visit prep reports
- **Vercel** — hosting

Total cost at this scale: **$0/month** on Supabase's and Vercel's free tiers, plus a few cents to
a couple of dollars a month in Claude API usage depending on how often you use the prep/auto-fill
features (pay-as-you-go, no subscription).

## How access control works

There's no separate password system. Access is: **Google sign-in + an invite code you generate.**

1. You (the owner) sign in with Google once, then bootstrap yourself as the owner via one SQL
   statement (below).
2. From **Settings**, you generate an invite code (a random string like `FAMILY-7K2M9P`, valid for
   14 days). You choose how many people it can be used by — the same code can be shared with
   several family members; each of them enters it once when they first sign in, and it stops
   working once that many people have used it (or it expires).
3. You send that code to your family (WhatsApp, email, whatever) along with the site URL.
4. Each person opens the site, signs in with **their own Google account**, and is prompted for the
   code since they have no access yet. Entering it links their account permanently — after that
   they just sign in with Google, no code needed again.
5. Nobody else can get in: without a valid, unused invite code, a Google sign-in gets you to a
   "enter your invite code" screen and nowhere else. Every table's Row Level Security policy
   (see `supabase/schema.sql`) requires the signed-in user to already have a `profiles` row, so
   even a direct API/database query from an outsider returns nothing.

For real two-factor authentication, turn on **2-Step Verification** on both your and your
brother's Google accounts (Google Account → Security → 2-Step Verification) — that's the actual
second factor; the invite code is what keeps the workspace invite-only.

## One-time setup

### 1. Supabase project

1. Create a free account and project at [supabase.com](https://supabase.com).
2. In the project, go to **SQL Editor → New query**, paste the entire contents of
   `supabase/schema.sql`, and run it. This creates all tables, Row Level Security policies, and
   the private storage bucket.
3. Go to **Authentication → Providers → Google** and enable it. You'll need a Google OAuth Client
   ID/secret:
   - In [Google Cloud Console](https://console.cloud.google.com/), create a project (or reuse one),
     go to **APIs & Services → Credentials → Create Credentials → OAuth client ID**, type "Web
     application".
   - Add an **Authorized redirect URI**: Supabase shows you the exact callback URL to paste here
     (format: `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback`) — copy it from the Supabase
     Google provider settings page.
   - Copy the generated Client ID and Client Secret back into Supabase's Google provider settings
     and save.
4. Go to **Authentication → URL Configuration** and set the **Site URL** to your eventual Vercel
   URL (you can update this after deploying — `http://localhost:3000` works for now while testing
   locally).
5. Go to **Project Settings → API** and copy: the Project URL, the `anon` public key, and the
   `service_role` secret key. You'll need these as environment variables.

### 2. Anthropic API key

Create a key at [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys).
This powers the "auto-fill from file with AI" button and the "Prepare for doctor visit" report.

### 3. Run locally

```bash
npm install
cp .env.example .env.local
# edit .env.local with the Supabase and Anthropic values from above
npm run dev
```

Open `http://localhost:3000`, sign in with Google — you'll land on the invite-code screen since
you have no profile yet. Go to Supabase's **SQL Editor** and run (with your real email):

```sql
insert into profiles (id, email, role)
select id, email, 'owner'
from auth.users
where email = 'your-email@gmail.com'
on conflict (id) do nothing;
```

Refresh the app — you're in, as the owner. From **Settings**, generate an invite code for your
brother.

### 4. Deploy to Vercel (free)

```bash
npm install -g vercel   # if you don't have the CLI
vercel
```

Or connect the GitHub repo at [vercel.com/new](https://vercel.com/new) for automatic deploys on
every push. Either way, add the same environment variables from `.env.local` in the Vercel
project's **Settings → Environment Variables** (set `NEXT_PUBLIC_SITE_URL` to your real
`https://your-app.vercel.app` URL once you know it). Redeploy after adding them.

Finally, go back to Supabase **Authentication → URL Configuration** and update the **Site URL**
(and add the Vercel URL to **Redirect URLs**) so Google sign-in redirects correctly in production.

## Using it

- **Dashboard** — filterable list of every record (by type, doctor, condition, date range, search).
- **Add** — upload a PDF, choose an existing photo, or take one with your phone's camera. As soon
  as a file is selected, Claude reads it and auto-fills title, type, doctor, date, condition tags,
  and summary — review and edit before saving (there's a "Re-run auto-fill" button if it needs
  another pass). Every field is required to save, so records stay consistently filled in.
- **Doctors** — a contact list, auto-populated as you tag documents with doctor names. Each doctor
  can have one or more assistants on file (name + phone), added at creation or any time after.
- **Prep for Visit** — pick a doctor and/or condition(s) and a date range, and get a structured
  markdown report: timeline since the last relevant record, trends the data supports (it won't
  invent ones it can't support), medications mentioned, and questions worth asking. Printable to
  PDF straight from the browser.
- **Case Summary** — a living "state of the case" summary (conditions, care team, current
  medications, recent developments, open questions) that Claude maintains over time. Click "Update
  case summary" any time new records come in; each update is saved so there's a history of how the
  picture has evolved, and the latest one is always shown.
- **Ask** — a shared chat thread for open-ended questions about Dad's case ("what did the last
  oncology visit say?"), grounded in the current case summary plus every record on file. The whole
  family sees and can add to the same thread.
- **Settings** — generate invite codes (owner only), see who has access.

## Known limitations / good next steps

- **Prep quality depends on what's in the "Summary" field.** The app doesn't yet OCR full lab
  tables into structured data — it relies on the short summary typed at upload time (or
  AI-suggested from the scan). If you want real trend-lines (e.g. a creatinine graph over time),
  that's a natural next feature: extract structured values at upload instead of just a text
  summary.
- **Supabase free tier caps at 500 MB database / 1 GB file storage**, and pauses a project after a
  week of total inactivity (one click in the dashboard un-pauses it). Metadata (500 MB) is
  essentially unlimited for this use case; 1 GB of scanned documents is a few hundred to a
  thousand files depending on scan quality — if you outgrow it, either upgrade Supabase
  ($25/month Pro removes the cap) or move file storage to Cloudflare R2 (10 GB free, no egress
  fees, S3-compatible) while keeping Supabase for the database — happy to build that swap later.
- **No mobile app** — it's a responsive website, works fine on a phone browser, but isn't
  installable as a native app. Could be turned into a installable PWA fairly easily if useful.
- This is a from-scratch codebase you fully own — no vendor lock-in, but also no vendor doing the
  security hardening for you beyond what Supabase/Vercel provide at the infrastructure level. The
  RLS policies in `supabase/schema.sql` are the actual access-control enforcement; review them if
  you extend the schema.
