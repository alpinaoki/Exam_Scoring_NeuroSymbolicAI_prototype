'use client'

import type { CSSProperties } from 'react'
import AnswerActionBar from './AnswerActionBar'
import { formatDateTime } from '../lib/time'
import UserBadge from './UserBadge'

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
  const timeLabel = formatDateTime(createdAt)

  return (
    <div style={styles.card}>
      <div style={styles.header}>
  <UserBadge username={username} />
  <span>@{username}</span>
  <span style={styles.date}>· {timeLabel}</span>
</div>


      {image && (
        <img
          src={image}
          alt="answer"
          style={styles.image}
        />
      )}

      <AnswerActionBar
        problemId={answerId}
        rootId={rootId}
        reactionCount={0}
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
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  fontSize: '13px',
  color: '#555',
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
