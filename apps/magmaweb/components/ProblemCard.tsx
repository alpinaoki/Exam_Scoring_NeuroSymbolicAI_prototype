'use client'

import type { CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import ProblemActionBar from './ProblemActionBar'
import { getAnswerCount } from '../lib/posts'
import { formatDateTime } from '../lib/time'

type Props = {
  image: string | null
  problemId: string
  username: string
  createdAt: string
}

export default function ProblemCard({
  image,
  problemId,
  username,
  createdAt,
}: Props) {
  const router = useRouter()
  const [answerCount, setAnswerCount] = useState(0)

  useEffect(() => {
    getAnswerCount(problemId).then(setAnswerCount)
  }, [problemId])

  const date = new Date(createdAt).toLocaleDateString('ja-JP')
  const timeLabel = formatDateTime(createdAt)
  
  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span>@{username}</span>
        <span style={styles.date}>· {timeLabel}</span>
      </div>

      {image && (
        <img
          src={image}
          alt="problem"
          style={{ ...styles.image, cursor: 'pointer' }}
          onClick={() => router.push(`/threads/${problemId}`)}
        />
      )}

      <ProblemActionBar
        problemId={problemId}
        rootId={problemId}
        bookmarkCount={12} // 仮
        answerCount={answerCount}
      />
    </div>
  )
}

const styles: { [key: string]: CSSProperties } = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  header: {
    fontSize: '13px',
    color: '#555',
  },
  date: {
    marginLeft: 4,
    color: '#999',
    fontSize: '12px',
  },
  image: {
    width: '100%',
    borderRadius: '8px',
    objectFit: 'contain',
    border: '1px solid #eee',
  },
}
