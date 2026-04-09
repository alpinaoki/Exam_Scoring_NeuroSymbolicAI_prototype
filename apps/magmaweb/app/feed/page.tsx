'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import LayoutShell from '../../components/LayoutShell'
import ProblemFeed from '../../components/ProblemFeed'
import QuestionCard from '../../components/QuestionCard' // 追加
import { getQuestionThreads } from '../../lib/posts' // 先程追加した関数

export default function FeedPage() {
  const router = useRouter()

  // 🔥 タブ状態
  const [tab, setTab] = useState<'recommend' | 'question'>('recommend')
  
  // 🔥 質問データ用の状態
  const [questionThreads, setQuestionThreads] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

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

  // 🔥 質問タブが選択された時にデータをフェッチ
  useEffect(() => {
    if (tab === 'question') {
      setLoading(true)
      getQuestionThreads()
        .then(data => {
          // QuestionCardが使いやすい形に整形
          const formatted = data.map((r: any) => ({
            problem: {
              id: r.post.parent.id,
              image_url: r.post.parent.image_url,
              username: r.post.parent.profiles?.username || 'unknown',
              created_at: r.post.parent.created_at,
              anonymous: r.post.parent.anonymous,
              label: r.post.parent.label
            },
            answer: {
              id: r.post.id,
              image_url: r.post.image_url
            },
            reactions: [{
              id: r.id,
              comment: r.comment,
              username: r.post.profiles?.username || 'unknown'
            }]
          }))
          setQuestionThreads(formatted)
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false))
    }
  }, [tab])

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
            <div style={{ paddingTop: '16px' }}>
              {loading ? (
                <div style={styles.emptyState}>読み込み中...</div>
              ) : questionThreads.length > 0 ? (
                questionThreads.map((data, idx) => (
                  <QuestionCard key={idx} data={data} />
                ))
              ) : (
                <div style={styles.emptyState}>進行中の質問はありません。</div>
              )}
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
    background: '#2C3E50', // ←統一
    borderBottom: '1px solid #3d566e',
  },

  tabButton: {
    flex: 1,
    padding: '12px 0',
    background: 'none',
    border: 'none',
    color: '#888',
    fontSize: 15,
    fontWeight: 'bold' as const,
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
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#999',
  }
}