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
    /* 背景用コンテナ: 熱量をしっかり感じるマグマ風グラデーション */
    <div style={{
      minHeight: '100vh',
      width: '100%',
      // 中心を「白熱した白〜黄色」、中間に「オレンジ」、端に「濃い赤〜深いグレー」を配置
      background: 'radial-gradient(circle at 50% 20%, #ffffff 0%, #fff3e0 20%, #ffab91 50%, #d84315 85%, #2c0d05 100%)',
      backgroundAttachment: 'fixed', // スクロールしても背景が固定される
      paddingBottom: '40px'
    }}>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 24, 
        padding: '0 8px',
        maxWidth: '800px',
        margin: '0 auto' 
      }}>
        
        {/* 戻るリンク: 背景が濃くなったので色を白に変更して視認性を確保 */}
        <button
          onClick={() => router.back()}
          style={{
            alignSelf: 'flex-start',
            background: 'none',
            border: 'none',
            color: '#ffffff', // 背景が赤・オレンジ系になるので白が見やすいです
            cursor: 'pointer',
            padding: '10px 0',
            marginTop: '10px',
            marginBottom: '5px',
            marginLeft: '3px',
            transition: 'transform 0.2s',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <CircleArrowLeft size={30} />
        </button>

        {/* 問題カード本体 */}
        <div style={{
           filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))' // カードを浮かせて高級感を
        }}>
          <ProblemCard
            image={problem.image_url}
            problemId={problem.id}
            username={problem.profiles.handle}
            createdAt={problem.created_at}
          />
        </div>

        {/* 解答一覧 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {answers.map((a) => (
            <div key={a.id} style={{
              filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.15))'
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