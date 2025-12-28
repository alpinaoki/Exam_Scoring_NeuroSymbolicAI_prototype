import ProblemFeed from '../../components/ProblemFeed'
import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

export default async function FeedPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data } = await supabase.auth.getUser()

  if (!data.user) {
    redirect('/login')
  }

  return (
    <div>
      <h1>Problem Feed</h1>
      <p>ログイン済みです</p>
    </div>
  )
}

