'use client'

import type { CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import ProblemActionBar from './ProblemActionBar'
import { getAnswerCount, updateProblemLabel } from '../lib/posts'
import { formatDateTime } from '../lib/time'
import UserBadge from './UserBadge'
import {
  COURSE_TAGS,
  UNIT_TAGS,
  OTHER_TAGS,
} from '../lib/mathTags'

type Props = {
  image: string | null
  problemId: string
  username: string
  createdAt: string
  label?: string | null
  isMine?: boolean
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

  const [tags, setTags] = useState<string[]>(
    label
      ?.split(',')
      .map((l) => l.trim())
      .filter(Boolean) ?? []
  )

  useEffect(() => {
    getAnswerCount(problemId).then(setAnswerCount)
  }, [problemId])

  const timeLabel = formatDateTime(createdAt)

  /** タグを押した瞬間に保存 */
  const toggleTag = async (tag: string) => {
    const nextTags = tags.includes(tag)
      ? tags.filter((t) => t !== tag)
      : [...tags, tag]

    setTags(nextTags)
    await updateProblemLabel(problemId, nextTags.join(', '))
    router.refresh()
  }

  const renderTagGroup = (title: string, list: readonly string[]) => (
    <div style={styles.group}>
      <div style={styles.groupTitle}>{title}</div>
      <div style={styles.tagGrid}>
        {list.map((t) => {
          const active = tags.includes(t)
          return (
            <span
              key={t}
              style={{
                ...styles.tagOption,
                ...(active ? styles.tagActive : {}),
              }}
              onClick={() => toggleTag(t)}
            >
              {t}
            </span>
          )
        })}
      </div>
    </div>
  )

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div
          style={styles.user}
          onClick={() => router.push(`/profiles/${username}`)}
        >
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

      {/* 表示用タグ */}
      <div style={styles.labelRow}>
        {tags.map((t) => (
          <span
            key={t}
            style={styles.label}
            onClick={(e) => {
              e.stopPropagation()
              router.push(`/search/${encodeURIComponent(t)}`)
            }}
          >
            #{t}
          </span>
        ))}

        {isMine && (
          <span
            style={styles.addLabel}
            onClick={(e) => {
              e.stopPropagation()
              setTagOpen(true)
            }}
          >
            ＋タグを追加
          </span>
        )}
      </div>

      {/* タグ選択ポップオーバー */}
      {tagOpen && isMine && (
        <div style={styles.tagPopover} onClick={(e) => e.stopPropagation()}>
          {renderTagGroup('科目', COURSE_TAGS)}
          {renderTagGroup('単元', UNIT_TAGS)}
          {renderTagGroup('その他', OTHER_TAGS)}
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
    position: 'relative',
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
    background: 'rgba(77,150,255,0.12)',
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
    width: 300,
    background: '#fff',
    border: '1px solid #ddd',
    borderRadius: 10,
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
    zIndex: 10,
  },
  group: {
    marginBottom: 12,
  },
  groupTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: '#666',
    marginBottom: 6,
  },
  tagGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagOption: {
    fontSize: 12,
    padding: '4px 10px',
    borderRadius: 999,
    background: '#f2f2f2',
    cursor: 'pointer',
  },
  tagActive: {
    background: 'rgba(77,150,255,0.18)',
    color: '#4D96FF',
    fontWeight: 700,
  },
}
