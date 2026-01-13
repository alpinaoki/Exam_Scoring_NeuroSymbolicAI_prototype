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

  if (!problem) return <div style={{ padding: 20 }}>Loading...</div>

  return (
    /* 全体コンテナ: 基本は白 */
    <div style={{
      minHeight: '100vh',
      width: '100%',
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
    }}>
      
      {/* 1. 問題セクション (真っ白) */}
      <div style={{ 
        width: '100%',
        padding: '0 8px 32px', // 下に少し余白を作ってグラデーションへの繋ぎに
        maxWidth: '800px',
        margin: '0 auto' 
      }}>
        {/* 戻るリンク: 背景が白なのでモノトーンに戻しました */}
        <button
          onClick={() => router.back()}
          style={{
            alignSelf: 'flex-start',
            background: 'none',
            border: 'none',
            color: '#333',
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

        {/* 問題カード */}
        <ProblemCard
          image={problem.image_url}
          problemId={problem.id}
          username={problem.profiles.handle}
          createdAt={problem.created_at}
        />
      </div>

      {/* 2. 回答セクション (ここからマグマ風グラデーション) */}
      <div style={{
        flexGrow: 1, // 残りの高さを埋める
        // 白から始まり、徐々に熱い色へ変化する線形グラデーション
        background: 'linear-gradient(to bottom, #ffffff 0%, #fff3e0 5%, #ffccbc 60%, #fe9676 100%)',
        padding: '24px 8px 60px',
      }}>
        <div style={{ 
          maxWidth: '800px',
          margin: '0 auto',
          display: 'flex', 
          flexDirection: 'column', 
          gap: 16 
        }}>
          {answers.map((a) => (
            <div key={a.id} style={{
              filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.08))' // 背景色の上でカードを際立たせる
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