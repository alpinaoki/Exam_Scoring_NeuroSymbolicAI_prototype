import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import ProblemFeed from '../../components/ProblemFeed'

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
    <>
      <h1 style={{ marginLeft: 20 }}>Magmathe</h1>
      <ProblemFeed />
    </>
  )
}
