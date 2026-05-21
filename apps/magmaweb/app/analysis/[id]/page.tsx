'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowDown, CheckCircle2, AlertCircle } from 'lucide-react'

type GraphNode = {
  id: string
  label: string
  type: 'proposition' | 'inference'
}

type GraphEdge = {
  from: string
  to: string
}

type ApiResponse = {
  imageUrl: string
  graph: {
    nodes: GraphNode[]
    edges: GraphEdge[]
  }
}

export default function AnalysisDetailPage() {
  const params = useParams()
  const router = useRouter()
  const answerId = params.id as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<ApiResponse | null>(null)

  useEffect(() => {
    async function initAnalysis() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/analyze?answerId=${answerId}`)
        
        if (!res.ok) {
          const errData = await res.json()
          throw new Error(errData.error || '分析に失敗しました')
        }
        
        const json = await res.json()
        setData(json)
      } catch (err: any) {
        console.error(err)
        setError(err.message || '予期せぬエラーが発生しました')
      } finally {
        setLoading(false)
      }
    }
    if (answerId) initAnalysis()
  }, [answerId])

  return (
    <div style={styles.container}>
      {/* ヘッダー */}
      <div style={styles.header}>
        <button onClick={() => router.back()} style={styles.backButton}>← タイムラインに戻る</button>
        <h1 style={styles.title}>論理構造 診断書</h1>
      </div>

      <div style={styles.contentLayout}>
        {/* 左側：生徒のオリジナル解答画像（デバッグ用） */}
<div style={styles.imageSection}>
  <h3 style={styles.sectionTitle}>提出された答案</h3>
  <div style={styles.imageWrapper}>
    {loading ? (
      <div style={styles.imagePlaceholder}>画像を読み込み中...</div>
    ) : data?.imageUrl ? (
      <div>
        <p style={{ fontSize: '11px', color: '#666', wordBreak: 'break-all', padding: '8px' }}>
          取得できたURL: {data.imageUrl}
        </p>
        <img src={data.imageUrl} alt="student answer" style={styles.rawImage} />
      </div>
    ) : (
      <div style={styles.imagePlaceholder}>
        画像URLが空です (ID: {answerId})
      </div>
    )}
  </div>
</div>

        {/* 右側：Geminiから返ってきた論理グラフの視覚化 */}
        <div style={styles.graphSection}>
          <h3 style={styles.sectionTitle}>解析された論理のDAG構造</h3>
          
          {loading ? (
            <div style={styles.loadingBox}>
              <div style={styles.spinner} />
              <p style={{ marginTop: 16, color: '#666', fontSize: 14 }}>Gemini Proが答案のロジックを解体中...</p>
            </div>
          ) : error ? (
            <div style={styles.errorBox}>
              <AlertCircle size={20} color="#ff6b6b" />
              <p style={{ color: '#ff6b6b', margin: 0, fontSize: 14 }}>{error}</p>
            </div>
          ) : data?.graph ? (
            <div style={styles.timeline}>
              {data.graph.nodes.map((node, index) => {
                const isProp = node.type === 'proposition'
                return (
                  <div key={node.id} style={styles.nodeWrapper}>
                    <div style={{
                      ...styles.nodeBox,
                      background: isProp ? '#FFF9DB' : '#E3FAF2',
                      borderColor: isProp ? '#FAB005' : '#12B886',
                    }}>
                      <span style={{
                        ...styles.nodeBadge,
                        background: isProp ? '#FAB005' : '#12B886',
                      }}>
                        {isProp ? '命題' : '推論規則'}
                      </span>
                      <p style={styles.nodeLabel}>{node.label}</p>
                    </div>
                    {index < data.graph.nodes.length - 1 && (
                      <div style={styles.arrowBox}>
                        <ArrowDown size={18} color="#aaa" />
                      </div>
                    )}
                  </div>
                )
              })}
              <div style={styles.successEnd}>
                <CheckCircle2 size={20} color="#12B886" />
                <span style={{ fontSize: 13, color: '#12B886', fontWeight: 'bold' }}>検証エンドポイント</span>
              </div>
            </div>
          ) : (
            <p style={{ color: '#777' }}>データ解析のデータが空です。</p>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: { padding: '24px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' },
  header: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: '24px' },
  backButton: { background: 'none', border: 'none', color: '#4D96FF', cursor: 'pointer', fontSize: '15px', fontWeight: 'bold' },
  title: { fontSize: '20px', fontWeight: 700, color: '#333' },
  contentLayout: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' },
  imageSection: { background: '#fff', padding: '16px', borderRadius: '16px', border: '1px solid #eee' },
  sectionTitle: { fontSize: '15px', fontWeight: 700, marginBottom: '12px', color: '#555' },
  imageWrapper: { width: '100%', borderRadius: '12px', overflow: 'hidden', background: '#f8f9fa', border: '1px solid #f0f0f0' },
  rawImage: { width: '100%', display: 'block', height: 'auto' },
  imagePlaceholder: { padding: '100px 20px', textAlign: 'center' as const, color: '#aaa', fontSize: '13px' },
  graphSection: { background: '#fff', padding: '16px', borderRadius: '16px', border: '1px solid #eee', minHeight: '450px' },
  loadingBox: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: '120px 0' },
  errorBox: { display: 'flex', alignItems: 'center', gap: 8, padding: '16px', background: '#fff5f5', borderRadius: '8px' },
  spinner: { width: '32px', height: '32px', border: '3px solid #E4E9F2', borderTopColor: '#4D96FF', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  timeline: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 4, width: '100%' },
  nodeWrapper: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', width: '100%' },
  nodeBox: { width: '90%', padding: '14px 16px', borderRadius: '12px', border: '1.5px solid', position: 'relative' as const, boxShadow: '0 2px 6px rgba(0,0,0,0.01)' },
  nodeBadge: { position: 'absolute' as const, top: '-9px', left: '12px', fontSize: '10px', padding: '1px 6px', borderRadius: '4px', color: '#fff', fontWeight: 'bold' },
  nodeLabel: { fontSize: '14px', color: '#2b2b2b', margin: 0, marginTop: '2px', wordBreak: 'break-all' as const, fontFamily: 'monospace' },
  arrowBox: { margin: '2px 0' },
  successEnd: { display: 'flex', alignItems: 'center', gap: 6, marginTop: '16px' }
}