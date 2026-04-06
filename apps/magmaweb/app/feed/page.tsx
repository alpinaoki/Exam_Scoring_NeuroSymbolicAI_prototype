'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import LayoutShell from '../../components/LayoutShell'
import ProblemFeed from '../../components/ProblemFeed'

export default function FeedPage() {
  const router = useRouter()

  // 🔥 タブ状態
  const [tab, setTab] = useState<'recommend' | 'question'>('recommend')

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
    <div style={styles.pageWrapper}>
      <LayoutShell>

        {/* ===== 上部タブ ===== */}
        <div style={styles.tabBar}>
          <button
            onClick={() => setTab('recommend')}
            style={{
              ...styles.tabButton,
              ...(tab === 'recommend' ? styles.activeTab : {})
            }}
          >
            おすすめ
          </button>

          <button
            onClick={() => setTab('question')}
            style={{
              ...styles.tabButton,
              ...(tab === 'question' ? styles.activeTab : {})
            }}
          >
            質問
          </button>
        </div>

        {/* ===== コンテンツ ===== */}
        <div style={styles.feedContainer}>
          {tab === 'recommend' && (
            <ProblemFeed />
          )}

          {tab === 'question' && (
            <div style={styles.emptyState}>
              {/* とりあえず空（あとで実装） */}
            </div>
          )}
        </div>

      </LayoutShell>
    </div>
  )
}

const styles = {
  pageWrapper: {
    backgroundColor: '#f9fafb',
    minHeight: '100vh',
  },

  // 🔥 タブバー
  tabBar: {
    position: 'sticky' as const,
    top: 32, // LayoutShellのheader分
    zIndex: 500,
    display: 'flex',
    background: '#111',
    borderBottom: '1px solid #222',
  },

  tabButton: {
    flex: 1,
    padding: '12px 0',
    background: 'none',
    border: 'none',
    color: '#888',
    fontSize: 15,
    fontWeight: 'bold',
    cursor: 'pointer',
  },

  activeTab: {
    color: '#fff',
    borderBottom: '2px solid #00aaff',
  },

  feedContainer: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '0 12px 100px 12px',
  },

  emptyState: {
    height: '60vh',
  }
}