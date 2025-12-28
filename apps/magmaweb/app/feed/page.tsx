'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import LayoutShell from '../../components/LayoutShell'
import ProblemFeed from '../../components/ProblemFeed'

export default function FeedPage() {
  const router = useRouter()
  const [openPost, setOpenPost] = useState(false)

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace('/login')
      }
    })
  }, [router])

  return (
    <>
      <LayoutShell onOpenPost={() => setOpenPost(true)}>
        <ProblemFeed />
      </LayoutShell>

      {openPost && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 2000,
          }}
          onClick={() => setOpenPost(false)}
        >
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '40%',
              background: '#111',
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* PostOverlay（仮） */}
          </div>
        </div>
      )}
    </>
  )
}
