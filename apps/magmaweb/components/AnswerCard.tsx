'use client'

import type { CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()
  const timeLabel = formatDateTime(createdAt)

  /** 回答者プロフィールへ */
  const goProfile = () => {
    router.push(`/profiles/${username}`)
  }

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.user} onClick={goProfile}>
          <UserBadge username={username} />
          <span>@{username}</span>
        </div>
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
    fontSize: 13,
    color: '#555',
  },
  user: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    cursor: 'pointer',
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
