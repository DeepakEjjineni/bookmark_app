# Smart Bookmark App

A real-time bookmark manager built with Next.js 16, Supabase, and TypeScript. Users can sign in with Google OAuth, save bookmarks privately, and see updates instantly across multiple tabs without page refresh.

![Smart Bookmark App](https://img.shields.io/badge/Next.js-16.1.6-black?logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Realtime-green?logo=supabase)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwind-css)

🔗 **Live Demo:** [https://bookmarkapp-snowy.vercel.app](https://bookmarkapp-snowy.vercel.app)

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with App Router and Server Components |
| **TypeScript** | Type safety and better IDE support |
| **Supabase** | Backend (PostgreSQL database, Auth, Realtime subscriptions) |
| **Tailwind CSS** | Utility-first CSS for rapid UI development |
| **Vercel** | Deployment and hosting platform |

---

## 📁 Project Structure

```
smart-bookmark-app/
├── app/
│   ├── auth/callback/route.ts     # OAuth callback handler
│   ├── login/page.tsx              # Login page with Google button
│   ├── page.tsx                    # Main home page (server component)
│   ├── layout.tsx                  # Root layout
│   └── globals.css                 # Global styles
├── components/
│   ├── AddBookmarkForm.tsx         # Form to add new bookmarks
│   ├── DeleteButton.tsx            # Delete button for each bookmark
│   ├── RealtimeBookmarks.tsx       # List with real-time updates
│   └── SignOutButton.tsx           # Sign out button
├── lib/
│   ├── supabase-browser.ts         # Supabase client for browser
│   └── supabase-server.ts          # Supabase client for server
├── middleware.ts                   # Auth middleware (session refresh)
├── supabase-schema.sql             # Database schema and RLS policies
├── .env.local.example              # Environment variables template
└── package.json
```

---

## 🐛 Problems I Faced & How I Solved Them

### Problem 1: Realtime Events Not Firing

**Error:** Adding bookmarks in one tab didn't update other tabs in real-time.

**Cause:** The `bookmarks` table wasn't added to the Realtime publication, and the replica identity wasn't set to `full`.

**Solution:**
- Enabled the table in Supabase Realtime publication
- Set replica identity to full so all row data is broadcast:

```sql
alter publication supabase_realtime add table bookmarks;
alter table bookmarks replica identity full;
```

---

### Problem 2: TypeScript Errors with Payload Types

**Error:** `Property 'user_id' does not exist on type '{}'`

**Cause:** TypeScript couldn't infer the shape of Realtime payload objects.

**Solution:**
- Added explicit `any` type to the payload parameter in the Realtime callback:

```typescript
.on('postgres_changes', { ... }, (payload: any) => {
  // Now TypeScript allows payload.new.user_id
})
```

---

### Problem 3: Bookmarks Not Appearing Instantly in Same Tab

**Error:** When adding a bookmark, it would appear in other tabs instantly but not in the tab where the form was submitted.

**Cause:** After removing `router.refresh()`, there was no mechanism to update the local state in the form's tab. Only Realtime events were updating state.

**Solution:**
- Implemented optimistic updates using callbacks
- `AddBookmarkForm` now calls `onBookmarkAdded(data)` immediately after insert
- Parent component updates local state right away
- Realtime events are deduplicated to prevent duplicates

```typescript
// In AddBookmarkForm
const { data } = await supabase.from('bookmarks').insert(...).select().single()
if (onBookmarkAdded && data) {
  onBookmarkAdded(data) // Immediate local update
}

// In RealtimeBookmarks
function handleBookmarkAdded(newBookmark) {
  setBookmarks(prev => {
    if (prev.some(b => b.id === newBookmark.id)) return prev // Dedupe
    return [newBookmark, ...prev]
  })
}
```

## 🙏 Acknowledgments

- Built as part of a coding challenge/assignment
- Supabase for the excellent backend-as-a-service platform
- Next.js team for the amazing React framework
- Vercel for seamless deployment

---
