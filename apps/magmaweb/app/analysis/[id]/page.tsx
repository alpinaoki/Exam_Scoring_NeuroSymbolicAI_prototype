'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import AnswerCard from '../../../components/AnswerCard'
import DagVisualizer from '../../../components/DagVisualizer' // 新設したコンポーネント
import { CircleArrowLeft, Layers } from 'lucide-react'

// 研究用グラフデータの型宣言
type GraphData = {
  nodes: Array<{ id: string; label: string; type: 'proposition' | 'inference' }>
  edges: Array<{ from: string; to: string }>
}

export default function AnalysisPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [answerData, setAnswerData] = useState<any>(null)
  
  // 厳密な構造化DAGデータをステートで持つ
  const [graphData, setGraphData] = useState<GraphData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAnalysisData() {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        // ① posts から該当の答案データを取得
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

        // ② api/analyze/route.ts の仕様 (GET / ?answerId=) に完全に合わせる
        const res = await fetch(`/api/analyze?answerId=${params.id}`, {
          method: 'GET',
        })

        if (!res.ok) throw new Error('DAGデータの取得に失敗しました')
        const json = await res.json()
        
        // APIから戻ってきた { imageUrl, graph } の構造から graph を抽出
        if (json.graph) {
          setGraphData(json.graph)
        }

      } catch (e) {
        console.error('診断書データ同期エラー:', e)
      } finally {
        setLoading(false)
      }
    }

    loadAnalysisData()
  }, [params.id])

  if (loading) {
    return <div style={{ padding: 20, textAlign: 'center', color: '#666' }}>論理構造の解析中…</div>
  }

  if (!answerData) {
    return <div style={{ padding: 20, textAlign: 'center', color: '#666' }}>答案が見つかりませんでした</div>
  }

  return (
    <div style={styles.container}>
      {/* ヘッダーエリア */}
      <div style={styles.header}>
        <button onClick={() => router.back()} style={styles.backButton}>
          <CircleArrowLeft size={30} />
        </button>
        <h1 style={styles.title}>論理構造 診断書</h1>
      </div>

      <div style={styles.mainGrid}>
        {/* 左側：答案カード */}
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

        {/* 右側：解析された論理のDAG構造可視化エリア */}
        <div style={styles.analysisSection}>
          <div style={styles.analysisHeader}>
            <Layers size={20} color="#4D96FF" />
            <span style={styles.analysisTitle}>解析された論理のDAG構造</span>
          </div>
          <div style={styles.analysisBody}>
            {graphData ? (
              <DagVisualizer graphData={graphData} />
            ) : (
              <div style={styles.errorText}>
                論理構造のグラフデータを読み込めませんでした。
              </div>
            )}
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
    width: '100%',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: '14px',
    textAlign: 'center' as const,
    padding: '20px 0',
  },
}