'use client'

import { useEffect, useState } from 'react'
import { getProblemById, getAnswersByProblemId } from '../../../lib/posts'
import ProblemCard from '../../../components/ProblemCard'

export default function ThreadPage({
  params,
}: {
  params: { id: string }
}) {
  const [problem, setProblem] = useState<any>(null)
  const [answers, setAnswers] = useState<any[]>([])

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 問題 */}
      <ProblemCard
  image={problem.image_url}
  problemId={problem.id}
  username={problem.profiles.handle}
/>


      {/* 解答一覧 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {answers.map((a) => (
          <img
            key={a.id}
            src={a.image_url}
            alt="answer"
            style={{
              width: '100%',
              border: '1px solid #eee',
              borderRadius: 8,
            }}
          />
        ))}
      </div>
    </div>
  )
}
