import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import RealtimeBookmarks from '@/components/RealtimeBookmarks'
import SignOutButton from '@/components/SignOutButton'

export default async function HomePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: bookmarks } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const name = user.user_metadata?.full_name || user.email || 'there'
  const avatar = user.user_metadata?.avatar_url

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          {avatar && (
            <img src={avatar} alt={name} className="w-8 h-8 rounded-full" />
          )}
          <div>
            <h1 className="text-sm font-semibold text-gray-800">
              Hey, {name.split(' ')[0]}!
            </h1>
            <p className="text-xs text-gray-400">Your bookmarks</p>
          </div>
        </div>
        <SignOutButton />
      </header>

      <RealtimeBookmarks initialBookmarks={bookmarks ?? []} userId={user.id} />
    </div>
  )
}
