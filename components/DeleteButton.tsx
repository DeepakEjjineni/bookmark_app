'use client'

import { createClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DeleteButton({ bookmarkId }: { bookmarkId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

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
      router.refresh()
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
