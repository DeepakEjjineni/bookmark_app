'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import DeleteButton from './DeleteButton'
import AddBookmarkForm from './AddBookmarkForm'

type Bookmark = {
  id: string
  url: string
  title: string
  created_at: string
  user_id: string
}

type Props = {
  initialBookmarks: Bookmark[]
  userId: string
}

export default function RealtimeBookmarks({ initialBookmarks, userId }: Props) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks)

  function handleBookmarkAdded(newBookmark: Bookmark) {
    console.log('➕ Locally adding bookmark (from form):', newBookmark)
    setBookmarks((prev) => {
      if (prev.some(b => b.id === newBookmark.id)) {
        return prev
      }
      return [newBookmark, ...prev]
    })
  }

  useEffect(() => {
    console.log('🔵 Setting up Realtime subscription for user:', userId)
    const supabase = createClient()

    const channel = supabase
      .channel('bookmarks-realtime-test')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookmarks',
        },
        (payload: any) => {
          console.log('🔴 REALTIME EVENT RECEIVED:', payload)
          
          if (payload.new?.user_id === userId && payload.eventType === 'INSERT') {
            console.log('➕ Adding from Realtime')
            setBookmarks((prev) => {
              if (prev.some(b => b.id === payload.new.id)) {
                console.log('⚠️ Bookmark already exists, skipping')
                return prev
              }
              return [payload.new as Bookmark, ...prev]
            })
          }
          
          if (payload.old?.user_id === userId && payload.eventType === 'DELETE') {
            console.log('➖ Removing from Realtime')
            setBookmarks((prev) => prev.filter((b) => b.id !== payload.old.id))
          }
        }
      )
      .subscribe((status) => {
        console.log('🟢 Subscription status:', status)
      })

    return () => {
      console.log('🔴 Cleaning up Realtime subscription')
      supabase.removeChannel(channel)
    }
  }, [userId])

  useEffect(() => {
    console.log('📦 Initial bookmarks updated:', initialBookmarks.length)
    setBookmarks(initialBookmarks)
  }, [initialBookmarks])

  if (bookmarks.length === 0) {
    return (
      <>
        <div className="mb-6">
          <AddBookmarkForm userId={userId} onBookmarkAdded={handleBookmarkAdded} />
        </div>
        <div className="text-center py-16 text-gray-400">
          <span className="text-3xl block mb-2">📭</span>
          <p className="text-sm">No bookmarks yet. Add one above!</p>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="mb-6">
        <AddBookmarkForm userId={userId} onBookmarkAdded={handleBookmarkAdded} />
      </div>
      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
          Saved ({bookmarks.length})
        </p>
        <ul className="flex flex-col gap-3">
          {bookmarks.map((bookmark) => {
            let domain = ''
            try {
              domain = new URL(bookmark.url).hostname
            } catch {
              domain = bookmark.url
            }

            return (
              <li
                key={bookmark.id}
                className="bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm flex items-start justify-between gap-3 group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                    alt=""
                    className="w-4 h-4 mt-1 rounded-sm flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                  <div className="min-w-0">
                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-gray-800 hover:text-blue-500 transition-colors truncate block"
                    >
                      {bookmark.title}
                    </a>
                    <span className="text-xs text-gray-400 truncate block">{domain}</span>
                  </div>
                </div>

                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DeleteButton bookmarkId={bookmark.id} />
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </>
  )
}
