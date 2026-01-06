'use client'

import type { CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import ProblemActionBar from './ProblemActionBar'

type Props = {
  image: string | null
  problemId: string
  username: string
  answerCount: number   // ← 追加
}

export default function ProblemCard({
  image,
  problemId,
  username,
  answerCount,
}: Props) {
  const router = useRouter()

  return (
    <div style={styles.card}>
      <div style={styles.username}>
        @{username}
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
        bookmarkCount={12}        // 仮
        answerCount={answerCount} // ← 正しく渡る
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
  image: {
    width: '100%',
    borderRadius: '8px',
    objectFit: 'contain',
    border: '1px solid #eee',
  },
  username: {
    fontSize: '13px',
    color: '#555',
  },
}
