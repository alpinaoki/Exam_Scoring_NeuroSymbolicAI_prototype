'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import AnswerCard from '../../../components/AnswerCard'
import { CircleArrowLeft, Sparkles } from 'lucide-react'

export default function AnalysisPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [answerData, setAnswerData] = useState<any>(null)
  const [aiAnalysis, setAiAnalysis] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAnalysisData() {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        // ① 今うまくいっている MePage や AnswerCard と同じ方法で、posts から解答を1件直撃で取得
        const { data: post, error: pError } = await supabase
          .from('posts')
          .select(`
            id,
            image_url,
            type,
            anonymous,
            created_at,
            user_id,
            parent_id,
            profiles ( handle )
          `)
          .eq('id', params.id)
          .single()

        if (pError) throw pError
        setAnswerData(post)

        // ② AIの分析診断書（テキスト）を取得するAPIを叩く
        // ※ API側には画像URLではなく、このanswerId（params.id）だけを渡してテキストを生成させる仕様にします
        const res = await fetch(`/api/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answerId: params.id }),
        })

        if (!res.ok) throw new Error('分析の取得に失敗しました')
        const json = await res.json()
        setAiAnalysis(json.analysis || '診断書がまだ作成されていません。')

      } catch (e) {
        console.error('診断書読み込みエラー:', e)
      } finally {
        setLoading(false)
      }
    }

    loadAnalysisData()
  }, [params.id])

  if (loading) {
    return <div style={{ padding: 20, textAlign: 'center', color: '#666' }}>診断書を読み込み中…</div>
  }

  if (!answerData) {
    return <div style={{ padding: 20, textAlign: 'center', color: '#666' }}>答案が見つかりませんでした</div>
  }

  return (
    <div style={styles.container}>
      {/* ヘッダー・戻るボタン */}
      <div style={styles.header}>
        <button onClick={() => router.back()} style={styles.backButton}>
          <CircleArrowLeft size={30} />
        </button>
        <h1 style={styles.title}>AI数学診断書</h1>
      </div>

      <div style={styles.mainGrid}>
        {/* 左側、あるいは上側：完全に実績のある AnswerCard をそのままはめ込む */}
        <div style={styles.cardSection}>
          <AnswerCard
            image={answerData.image_url}
            answerId={answerData.id}
            rootId={answerData.parent_id || answerData.id}
            username={answerData.profiles?.handle || 'unknown'}
            createdAt={answerData.created_at}
            anonymous={answerData.anonymous}
          />
        </div>

        {/* 右側、あるいは下側：AIの診断結果テキストを表示するエリア */}
        <div style={styles.analysisSection}>
          <div style={styles.analysisHeader}>
            <Sparkles size={20} color="#4D96FF" />
            <span style={styles.analysisTitle}>添削・アドバイス</span>
          </div>
          <div style={styles.analysisBody}>
            {aiAnalysis.split('\n').map((line, index) => (
              <p key={index} style={styles.textLine}>{line}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '16px 8px 48px',
    backgroundColor: '#fff',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: '#333',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  mainGrid: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 20,
  },
  cardSection: {
    width: '100%',
    filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.05))',
  },
  analysisSection: {
    background: '#f9f9fb',
    border: '1px solid #f0f0f4',
    borderRadius: '20px',
    padding: '20px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.01)',
  },
  analysisHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    borderBottom: '1px solid #eee',
    paddingBottom: 10,
    marginBottom: 14,
  },
  analysisTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  analysisBody: {
    fontSize: 15,
    color: '#444',
    lineHeight: 1.7,
  },
  textLine: {
    marginBottom: 8,
  },
}