'use client'

import type { CSSProperties } from 'react'
import ProblemActionBar from './ProblemActionBar'

type Props = {
  image: string | null
  answerId: string
  rootId: string
  username: string
}

export default function AnswerCard({
  image,
  answerId,
  rootId,
  username,
}: Props) {
  return (
    <div style={styles.card}>
      <div style={styles.username}>@{username}</div>

      {image && (
        <img
          src={image}
          alt="answer"
          style={styles.image}
        />
      )}

      <ProblemActionBar
        problemId={answerId}
        rootId={rootId}
        bookmarkCount={0}
        answerCount={0}
      />
    </div>
  )
}

const styles: { [key: string]: CSSProperties } = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    padding: '0 16px',
  },
  image: {
    width: '100%',
    borderRadius: 8,
    border: '1px solid #eee',
  },
  username: {
    fontSize: 12,
    color: '#666',
  },
}
