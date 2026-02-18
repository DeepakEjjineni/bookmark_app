'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

type Props = {
  bookmarkId: string
  onDeleted?: () => void
}

export default function DeleteButton({ bookmarkId, onDeleted }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    const confirmed = confirm('Delete this bookmark?')
    if (!confirmed) return

    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', bookmarkId)

    if (error) {
      console.error('Delete failed:', error)
      alert('Could not delete. Try again.')
    } else {
      if (onDeleted) {
        onDeleted()
      }
    }

    setLoading(false)
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-gray-400 hover:text-red-500 disabled:text-gray-300 transition-colors text-sm"
      title="Delete bookmark"
    >
      {loading ? '...' : '✕'}
    </button>
  )
}
