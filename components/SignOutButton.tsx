'use client'

import { createClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

export default function SignOutButton() {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleSignOut}
      className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
    >
      Sign out
    </button>
  )
}
