'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getProblemById, getAnswersByProblemId } from '../../../lib/posts'
import ProblemCard from '../../../components/ProblemCard'
import AnswerCard from '../../../components/AnswerCard'
import {ArrowBigLeft} from 'lucide-react'

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '0 8px' }}>
      
      {/* 戻るリンク */}
      <button
        onClick={() => router.replace(`/feed`)}
        style={{
          alignSelf: 'flex-start',
          background: 'none',
          border: 'none',
          color: '#0070f3',
          cursor: 'pointer',
          fontSize: '24px',
          margin: '5px',
        }}
      >
        <ArrowBigLeft size = {20}/>
      </button>

      {/* 問題 */}
      <ProblemCard
        image={problem.image_url}
        problemId={problem.id}
        username={problem.profiles.handle}
      />

      {/* 解答一覧 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {answers.map((a) => (
          <AnswerCard
            key={a.id}
            image={a.image_url}
            answerId={a.id}
            rootId={problem.id}
            username={a.profiles.handle}
          />
        ))}
      </div>
    </div>
  )
}
