'use client'

import type { CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import ProblemActionBar from './ProblemActionBar'
import { getAnswerCount, updateProblemLabel } from '../lib/posts'
import { formatDateTime } from '../lib/time'
import UserBadge from './UserBadge'

type Props = {
  image: string | null
  problemId: string
  username: string
  createdAt: string
  label?: string | null
  isMine?: boolean // ← 自分の投稿かどうか
}

export default function ProblemCard({
  image,
  problemId,
  username,
  createdAt,
  label,
  isMine = false,
}: Props) {
  const router = useRouter()
  const [answerCount, setAnswerCount] = useState(0)

  const [tagOpen, setTagOpen] = useState(false)
  const [draftLabel, setDraftLabel] = useState(label ?? '')

  useEffect(() => {
    getAnswerCount(problemId).then(setAnswerCount)
  }, [problemId])

  const timeLabel = formatDateTime(createdAt)

  /** 投稿者プロフィールへ */
  const goProfile = () => {
    router.push(`/profiles/${username}`)
  }

  // label を配列に分解
  const labels =
    label
      ?.split(',')
      .map((l) => l.trim())
      .filter(Boolean) ?? []

  const saveLabel = async () => {
    await updateProblemLabel(problemId, draftLabel)
    setTagOpen(false)
    router.refresh()
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

      <div style={styles.labelRow}>
        {labels.map((l) => (
          <span
            key={l}
            style={styles.label}
            onClick={(e) => {
              e.stopPropagation()
              router.push(`/search/${encodeURIComponent(l)}`)
            }}
          >
            #{l}
          </span>
        ))}

        {isMine && (
          <span
            style={styles.addLabel}
            onClick={(e) => {
              e.stopPropagation()
              setDraftLabel(label ?? '')
              setTagOpen(true)
            }}
          >
            ＋タグ
          </span>
        )}
      </div>

      {tagOpen && isMine && (
        <div style={styles.tagPopover} onClick={(e) => e.stopPropagation()}>
          <input
            autoFocus
            value={draftLabel}
            onChange={(e) => setDraftLabel(e.target.value)}
            placeholder="例: 二次関数, 数IA"
            style={styles.tagInput}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveLabel()
            }}
          />
          <div style={styles.actions}>
            <button onClick={saveLabel}>保存</button>
            <button onClick={() => setTagOpen(false)}>閉じる</button>
          </div>
        </div>
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
    position: 'relative', // ← popover 用
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
  labelRow: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
  },
  label: {
    fontSize: 12,
    fontWeight: 600,
    color: '#4D96FF',
    background: 'rgba(77, 150, 255, 0.12)',
    padding: '4px 10px',
    borderRadius: 999,
    cursor: 'pointer',
  },
  addLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: '#888',
    background: '#f3f3f3',
    padding: '4px 10px',
    borderRadius: 999,
    cursor: 'pointer',
  },
  tagPopover: {
    position: 'absolute',
    top: '100%',
    left: 0,
    marginTop: 6,
    padding: 12,
    background: '#fff',
    border: '1px solid #ddd',
    borderRadius: 8,
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
    zIndex: 10,
  },
  tagInput: {
    width: 220,
    fontSize: 13,
    padding: 6,
  },
  actions: {
    display: 'flex',
    gap: 8,
    marginTop: 8,
  },
}
