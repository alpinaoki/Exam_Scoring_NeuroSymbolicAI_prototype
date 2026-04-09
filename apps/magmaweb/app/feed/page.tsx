'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import LayoutShell from '../../components/LayoutShell'
import ProblemFeed from '../../components/ProblemFeed'
import QuestionCard from '../../components/QuestionCard'
import { getQuestionThreads } from '../../lib/posts'

export default function FeedPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'recommend' | 'question'>('recommend')
  const [questionThreads, setQuestionThreads] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  
  // デバッグ用
  const [debugRawData, setDebugRawData] = useState<any>(null)

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.replace('/login')
    })
  }, [router])

  useEffect(() => {
    if (tab === 'question') {
      setLoading(true)
      getQuestionThreads()
// useEffect 内の .then(data => { ... }) 部分
// feed/page.tsx の .then(data => { ... }) 内
.then(data => {
  setDebugRawData(data); // 念のためまだ残しておきます
  if (!data || data.length === 0) {
    setQuestionThreads([]);
    return;
  }

  const formatted = data
    .filter((r: any) => r.post && r.post.parent) // ここで「post」がnullなら弾かれます
    .map((r: any) => ({
      problem: {
        id: r.post.parent.id,
        image_url: r.post.parent.image_url,
        username: r.post.parent.profiles?.handle || 'unknown',
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
        username: r.post.profiles?.handle || 'unknown'
      }]
    }));
  
  setQuestionThreads(formatted);
})
        .catch(err => console.error("Fetch Error:", err))
        .finally(() => setLoading(false))
    }
  }, [tab])

  return (
    <div style={styles.pageWrapper}>
      <LayoutShell>
        <div style={styles.tabBar}>
          <button onClick={() => setTab('recommend')} style={{...styles.tabButton, ...(tab === 'recommend' ? styles.activeTab : {})}}>おすすめ</button>
          <button onClick={() => setTab('question')} style={{...styles.tabButton, ...(tab === 'question' ? styles.activeTab : {})}}>質問</button>
        </div>

        <div style={styles.feedContainer}>
          {tab === 'recommend' && <ProblemFeed />}

          {tab === 'question' && (
            <div style={{ paddingTop: '16px' }}>
              {/* デバッグ用パネル */}
              <div style={styles.debugPanel}>
                <p>取得件数: {debugRawData?.length || 0} 件</p>
                {debugRawData?.length > 0 && (
                   <details>
                     <summary>生のデータ構造を確認</summary>
                     <pre style={{fontSize: '10px', overflow: 'auto'}}>{JSON.stringify(debugRawData[0], null, 2)}</pre>
                   </details>
                )}
              </div>

              {loading ? (
                <div style={styles.emptyState}>読み込み中...</div>
              ) : questionThreads.length > 0 ? (
                questionThreads.map((data, idx) => (
                  <QuestionCard key={`${data.problem.id}-${idx}`} data={data} />
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
  pageWrapper: { backgroundColor: '#f9fafb', minHeight: '100vh' },
  tabBar: { position: 'sticky' as const, top: 32, zIndex: 500, display: 'flex', background: '#2C3E50', borderBottom: '1px solid #3d566e' },
  tabButton: { flex: 1, padding: '12px 0', background: 'none', border: 'none', color: '#888', fontSize: 15, fontWeight: 'bold' as const, cursor: 'pointer' },
  activeTab: { color: '#fff', borderBottom: '2px solid #00aaff' },
  feedContainer: { maxWidth: '600px', margin: '0 auto', padding: '0 12px 100px 12px' },
  emptyState: { height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' },
  debugPanel: { background: '#eee', padding: '10px', marginBottom: '10px', borderRadius: '8px', fontSize: '12px', color: '#333' }
}