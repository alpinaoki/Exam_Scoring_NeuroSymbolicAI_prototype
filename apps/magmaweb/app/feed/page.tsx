'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import LayoutShell from '../../components/LayoutShell'
import ProblemFeed from '../../components/ProblemFeed'

export default function FeedPage() {
  const router = useRouter()

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
    // 全体の背景色をほんのりグレー (#fcfcfc ~ #f8f9fa) に設定
    <div style={styles.pageWrapper}>
      <LayoutShell>
        <div style={styles.feedContainer}>
          <ProblemFeed />
        </div>
      </LayoutShell>
    </div>
  )
}

const styles = {
  pageWrapper: {
    backgroundColor: '#f9fafb', // 真っ白ではなく、少しだけ色を落とす
    minHeight: '100vh',
  },
  feedContainer: {
    maxWidth: '600px', // モバイルで見やすい幅に固定
    margin: '0 auto',
    padding: '0 12px 100px 12px', // 下部にナビバーとの重なりを防ぐ余白
  }
}