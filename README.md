# Smart Bookmark App

A full-stack bookmark manager built with Next.js 14, Supabase, and Tailwind CSS. Users sign in with Google and can save, view, and delete their own private bookmarks. The list updates in real-time across tabs without refreshing the page.

## Tech Stack

- **Next.js 14** (App Router)
- **Supabase** (Auth via Google OAuth, PostgreSQL database, Realtime subscriptions)
- **Tailwind CSS** (styling)
- **Vercel** (deployment)

---

## Features

- Google OAuth sign-in (no email/password needed)
- Add bookmarks with a title and URL
- Bookmarks are private per user (Row Level Security)
- Real-time updates — open two tabs, add in one, see it in the other instantly
- Delete your own bookmarks
- Favicons loaded automatically from each site

---

## Project Structure

```
smart-bookmark-app/
├── app/
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts       # handles OAuth redirect from Supabase
│   ├── login/
│   │   └── page.tsx           # login page with Google button
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx               # main home page (server component)
├── components/
│   ├── AddBookmarkForm.tsx    # form for adding bookmarks (client)
│   ├── DeleteButton.tsx       # delete button per bookmark (client)
│   ├── RealtimeBookmarks.tsx  # list with realtime subscription (client)
│   └── SignOutButton.tsx      # sign out button (client)
├── lib/
│   ├── supabase-browser.ts    # supabase client for browser
│   └── supabase-server.ts     # supabase client for server components
├── middleware.ts               # protects routes, refreshes session
├── supabase-schema.sql        # run this in Supabase SQL editor
└── .env.local.example
```

---

## Setup Instructions

### Step 1 — Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once it's ready, go to **Settings > API** and copy your:
   - Project URL
   - anon/public key

### Step 2 — Google OAuth in Supabase

1. In Supabase Dashboard, go to **Authentication > Providers**
2. Find **Google** and enable it
3. You'll need a Google OAuth Client ID and Secret:
   - Go to [console.cloud.google.com](https://console.cloud.google.com)
   - Create a new project (or use existing)
   - Go to **APIs & Services > Credentials > Create Credentials > OAuth client ID**
   - Application type: **Web application**
   - Add this to Authorized redirect URIs: `https://your-project-ref.supabase.co/auth/v1/callback`
   - Copy the Client ID and Client Secret back into Supabase
4. In Supabase under Authentication > URL Configuration, add your site URL (for local: `http://localhost:3000`)

### Step 3 — Database Setup

1. In Supabase Dashboard, go to **SQL Editor**
2. Paste everything from `supabase-schema.sql` and click Run
3. This creates the `bookmarks` table with RLS policies and enables realtime

### Step 4 — Enable Realtime

1. In Supabase Dashboard, go to **Database > Replication**
2. Under "supabase_realtime" publication, toggle on the **bookmarks** table

### Step 5 — Environment Variables

Create a `.env.local` file in the root of the project:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 6 — Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploying to Vercel

1. Push the project to a public GitHub repo
2. Go to [vercel.com](https://vercel.com) and import the repo
3. Add environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy — Vercel gives you a live URL like `https://your-app.vercel.app`
5. Go back to Supabase **Authentication > URL Configuration** and add your Vercel URL to "Site URL" and "Redirect URLs"
6. Also update your Google OAuth credentials to allow the Vercel domain as an Authorized redirect URI

---

## Problems I Ran Into & How I Solved Them

**1. Session not persisting between pages**
The first time I set up Supabase, my session would vanish after navigating. The fix was adding the middleware (`middleware.ts`) which refreshes the session token on every request. Without this, the cookies expire and the user gets logged out randomly.

**2. Realtime not firing events**
I set up the channel subscription but wasn't getting any events. Turned out I forgot to enable the bookmarks table in the Replication settings in Supabase Dashboard. After toggling that on, events started coming through immediately.

**3. Server component vs client component confusion**
Next.js App Router defaults to server components, which can't use hooks like `useState` or `useEffect`. I had to split the UI into: server components (for fetching data from Supabase using the server client) and client components with `'use client'` at the top (for anything interactive or subscribing to realtime). The rule of thumb I followed: if it has interactivity or uses browser APIs, it's a client component.

**4. Row Level Security blocking inserts**
After setting up RLS, my inserts were failing silently. The issue was my insert policy was missing or wrong. I had to make sure the `with check` clause matched `auth.uid() = user_id`, and that I was actually passing the `user_id` field in the insert payload on the frontend.

**5. Google OAuth redirect URL mismatch**
After deploying to Vercel, Google OAuth would give a redirect_uri_mismatch error. I forgot to add the production Vercel URL to the authorized redirect URIs in Google Cloud Console AND to the Supabase URL configuration. Once both were updated, it worked fine.
