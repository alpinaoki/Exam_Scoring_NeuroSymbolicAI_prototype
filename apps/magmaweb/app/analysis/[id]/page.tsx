'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import AnswerCard from '../../../components/AnswerCard'
import DagVisualizer from '../../../components/DagVisualizer' // 新設したコンポーネント
import { CircleArrowLeft, Layers, AlertTriangle } from 'lucide-react'

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

  // 【追加】既存の処理を壊さずにエラーを画面に露出させるためのデバッグ用ステート
  const [debugError, setDebugError] = useState<string | null>(null)
  const [debugDetails, setDebugDetails] = useState<string | null>(null)
  const [debugRawText, setDebugRawText] = useState<string | null>(null)

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

        const json = await res.json()

        // HTTPステータスが200以外のエラーだった場合
        if (!res.ok) {
          setDebugError(`APIがエラーステータス ${res.status} を返しました`)
          setDebugDetails(json.error + (json.details ? `\n${json.details}` : ''))
          return
        }

        // 200が戻ってきたが、APIの内部パースエラーなどで error フラグが入っている場合
        if (json.error) {
          setDebugError(json.error)
          if (json.rawText) setDebugRawText(json.rawText)
          return
        }
        
        // APIから戻ってきた { imageUrl, graph } の構造から graph を抽出
        if (json.graph) {
          setGraphData(json.graph)
        }

      } catch (e: any) {
        console.error('診断書データ同期エラー:', e)
        setDebugError('フロントエンドの処理中に例外が発生しました')
        setDebugDetails(e?.message || String(e))
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

      {/* 🚨 【追加】画面直出しデバッグモニター（エラー発生時のみ最上部に自動出現） */}
      {(debugError || debugDetails || debugRawText) && (
        <div style={styles.debugBox}>
          <div style={styles.debugHeader}>
            <AlertTriangle size={20} color="#ff4d4d" />
            <span style={styles.debugTitle}>デバッグモニター (データ未着の原因)</span>
          </div>
          {debugError && <p style={styles.debugItem}><strong>Error:</strong> {debugError}</p>}
          {debugDetails && (
            <div style={styles.debugItem}>
              <strong>Details:</strong>
              <pre style={styles.debugPre}>{debugDetails}</pre>
            </div>
          )}
          {debugRawText && (
            <div style={styles.debugItem}>
              <strong>Geminiが返してきた生のテキストデータ:</strong>
              <pre style={styles.debugRawPre}>{debugRawText}</pre>
            </div>
          )}
        </div>
      )}

      <div style={styles.mainGrid}>
        {/* 左側：答案カード（既存の引数を完全に維持） */}
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
                論理構造のグラフデータを読み込めませんでした。上のデバッグモニターを確認してください。
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
  
  // デバッグ表示用の拡張CSSスタイル
  debugBox: {
    backgroundColor: '#fff5f5',
    border: '2px solid #ffcccc',
    borderRadius: '16px',
    padding: '16px',
    marginBottom: '20px',
  },
  debugHeader: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: '12px' },
  debugTitle: { fontWeight: 'bold' as const, color: '#e53e3e', fontSize: '15px' },
  debugItem: { fontSize: '13px', color: '#2d3748', marginBottom: '8px' },
  debugPre: { backgroundColor: '#edf2f7', padding: '8px', borderRadius: '6px', overflowX: 'auto' as const, marginTop: '4px', fontFamily: 'monospace' },
  debugRawPre: { backgroundColor: '#1a202c', color: '#aeebd0', padding: '12px', borderRadius: '8px', overflowX: 'auto' as const, marginTop: '4px', fontFamily: 'monospace', fontSize: '12px', lineHeight: 1.4 }
}