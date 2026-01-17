'use client'

import type { CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import ProblemActionBar from './ProblemActionBar'
import { getAnswerCount } from '../lib/posts'
import { formatDateTime } from '../lib/time'
import UserBadge from './UserBadge'

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

  const timeLabel = formatDateTime(createdAt)

  /** 投稿者プロフィールへ */
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
          alt="problem"
          style={styles.image}
          onClick={() => router.push(`/threads/${problemId}`)}
        />
      )}

      <ProblemActionBar
        problemId={problemId}
        rootId={problemId}
        answerCount={answerCount}
      />
    </div>
  )
}

const styles: { [key: string]: CSSProperties } = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
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
    color: '#999',
    fontSize: 12,
  },
  image: {
    width: '100%',
    borderRadius: 8,
    objectFit: 'contain',
    border: '1px solid #eee',
    cursor: 'pointer',
  },
}
