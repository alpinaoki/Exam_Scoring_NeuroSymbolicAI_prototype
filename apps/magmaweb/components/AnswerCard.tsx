'use client'

import type { CSSProperties } from 'react'
import ProblemActionBar from './ProblemActionBar'

type Props = {
  image: string | null
  answerId: string
  rootId: string
  username: string
  createdAt: string
}

export default function AnswerCard({
  image,
  answerId,
  rootId,
  username,
  createdAt,
}: Props) {
  const date = new Date(createdAt).toLocaleDateString('ja-JP')

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span>@{username}</span>
        <span style={styles.date}>· {date}</span>
      </div>

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
  header: {
    fontSize: 12,
    color: '#666',
  },
  date: {
    marginLeft: 4,
    color: '#aaa',
    fontSize: 11,
  },
  image: {
    width: '100%',
    borderRadius: 8,
    border: '1px solid #eee',
  },
}
