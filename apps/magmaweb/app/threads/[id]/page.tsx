'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getProblemById, getAnswersByProblemId } from '../../../lib/posts'
import ProblemCard from '../../../components/ProblemCard'
import AnswerCard from '../../../components/AnswerCard'
import { CircleArrowLeft } from 'lucide-react'

export default function ThreadPage({
  params,
}: {
  params: { id: string }
}) {
  const [problem, setProblem] = useState<any>(null)
  const [answers, setAnswers] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const p = await getProblemById(params.id)
      const a = await getAnswersByProblemId(params.id)
      setProblem(p)
      setAnswers(a)
    }
    load()
  }, [params.id])

  if (!problem) return <div>Loading...</div>

  return (
    /* 背景用コンテナ: 白ベースのマグマ風グラデーション */
    <div style={{
      minHeight: '100vh',
      width: '100%',
      // radial-gradientを使って、中心から熱が伝わっているような淡いグラデーション
      background: 'radial-gradient(circle at 50% 20%, #ffffff 0%, #fff9f8 40%, #f7f7f7 70%, #f2f2f2 100%)',
      paddingBottom: '40px'
    }}>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 24, 
        padding: '0 8px',
        maxWidth: '800px', // コンテンツが広がりすぎないように制限（任意）
        margin: '0 auto' 
      }}>
        
        {/* 戻るリンク */}
        <button
          onClick={() => router.back()}
          style={{
            alignSelf: 'flex-start',
            background: 'none',
            border: 'none',
            color: '#333', // 青からモノトーンに変更
            cursor: 'pointer',
            padding: '10px 0',
            marginTop: '10px',
            marginBottom: '5px',
            marginLeft: '3px',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.6'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          <CircleArrowLeft size={30} />
        </button>

        {/* 問題 */}
        <ProblemCard
          image={problem.image_url}
          problemId={problem.id}
          username={problem.profiles.handle}
          createdAt={problem.created_at}
        />

        {/* 解答一覧 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {answers.map((a) => (
            <div key={a.id} style={{
              filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.02))' // 答案を少し浮かせると高級感が出ます
            }}>
              <AnswerCard
                image={a.image_url}
                answerId={a.id}
                rootId={problem.id}
                username={a.profiles.handle}
                createdAt={a.created_at}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}