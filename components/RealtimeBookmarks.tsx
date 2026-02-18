'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import DeleteButton from './DeleteButton'

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

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('bookmarks-realtime')
      .on(
        'postgres_changes',
        {
          event: '*', 
          schema: 'public',
          table: 'bookmarks',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setBookmarks((prev) => [payload.new as Bookmark, ...prev])
          } else if (payload.eventType === 'DELETE') {
            setBookmarks((prev) =>
              prev.filter((b) => b.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()
      
    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <span className="text-3xl block mb-2">📭</span>
        <p className="text-sm">No bookmarks yet. Add one above!</p>
      </div>
    )
  }

  return (
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
              {/* favicon */}
              <img
                src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                alt=""
                className="w-4 h-4 mt-1 rounded-sm flex-shrink-0"
                onError={(e) => {
                  // if favicon fails to load, hide it
                  ;(e.target as HTMLImageElement).style.display = 'none'
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
  )
}
