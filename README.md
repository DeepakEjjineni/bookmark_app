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
