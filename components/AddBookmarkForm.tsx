'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

export default function AddBookmarkForm({ userId }: { userId: string }) {
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // basic url check
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      setError('URL must start with http:// or https://')
      setLoading(false)
      return
    }

    const supabase = createClient()

    const { error: insertError } = await supabase.from('bookmarks').insert({
      url: url.trim(),
      title: title.trim(),
      user_id: userId,
    })

    if (insertError) {
      setError('Something went wrong. Try again.')
      console.error(insertError)
    } else {
      setUrl('')
      setTitle('')
      router.refresh()
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
      <h2 className="text-base font-semibold text-gray-700 mb-4">Add a new bookmark</h2>

      {error && (
        <p className="text-sm text-red-500 mb-3 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}

      <div className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Title (e.g. Great article about React)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
        />
        <input
          type="text"
          placeholder="URL (e.g. https://example.com)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white text-sm font-medium py-2 rounded-lg transition-colors"
        >
          {loading ? 'Saving...' : 'Save bookmark'}
        </button>
      </div>
    </form>
  )
}
