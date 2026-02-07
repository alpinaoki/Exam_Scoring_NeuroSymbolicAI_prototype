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
  const [newTag, setNewTag] = useState('')

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

  const toggleTag = async (tag: string) => {
    const nextTags = tags.includes(tag)
      ? tags.filter((t) => t !== tag)
      : [...tags, tag]
    setTags(nextTags)
    await updateProblemLabel(problemId, nextTags.join(', '))
    router.refresh()
  }

  const addNewTag = async () => {
    const t = newTag.trim()
    if (!t || tags.includes(t)) return
    const nextTags = [...tags, t]
    setTags(nextTags)
    setNewTag('')
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
    <div style={styles.cardContainer}>
      <div style={styles.card}>
        {/* ヘッダー */}
        <div style={styles.header}>
          <div
            style={styles.user}
            onClick={() => router.push(`/profiles/${username}`)}
          >
            <UserBadge username={username} />
            <span style={styles.usernameText}>@{username}</span>
          </div>
          <span style={styles.date}>· {timeLabel}</span>
        </div>

        {/* 画像 */}
        {image && (
          <div style={styles.imageWrapper}>
            <img
              src={image}
              alt="problem"
              style={styles.image}
              onClick={() => router.push(`/threads/${problemId}`)}
            />
          </div>
        )}

        {/* 解答アクション（画像とタグの間に配置） */}
        <div style={styles.actionArea}>
          <ProblemActionBar
            problemId={problemId}
            rootId={problemId}
            answerCount={answerCount}
          />
        </div>

        {/* 表示タグ */}
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
              ＋タグを編集
            </span>
          )}
        </div>

        {/* タグモーダル */}
        {tagOpen && isMine && (
          <div style={styles.tagPopover} onClick={(e) => e.stopPropagation()}>
            <div style={styles.popoverHeader}>
              <span style={styles.popoverTitle}>タグを編集</span>
              <button style={styles.closeButton} onClick={() => setTagOpen(false)}>✕</button>
            </div>
            <div style={styles.newTagRow}>
              <input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addNewTag()}
                placeholder="新しいタグを入力"
                style={styles.input}
              />
              <button style={styles.addButton} onClick={addNewTag}>追加</button>
            </div>
            {renderTagGroup('科目', COURSE_TAGS)}
            {renderTagGroup('単元', UNIT_TAGS)}
            {renderTagGroup('その他', OTHER_TAGS)}
          </div>
        )}
      </div>
    </div>
  )
}

const styles: { [key: string]: CSSProperties } = {
  cardContainer: {
    padding: '8px 0',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    position: 'relative',
    background: '#fff',
    borderRadius: '16px',
    padding: '16px',
    border: '1px solid #f0f0f0',
    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  user: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    cursor: 'pointer',
  },
  usernameText: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#333',
  },
  date: {
    color: '#999',
    fontSize: '12px',
  },
  imageWrapper: {
    width: '100%',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid #f5f5f5',
  },
  image: {
    width: '100%',
    display: 'block',
    objectFit: 'contain',
    cursor: 'pointer',
  },
  actionArea: {
    background: '#fcfcfc',
    borderRadius: '12px',
    padding: '4px 8px',
  },
  labelRow: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap',
    marginTop: '4px',
  },
  label: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#4D96FF',
    background: '#F0F7FF',
    padding: '4px 12px',
    borderRadius: '999px',
    cursor: 'pointer',
  },
  addLabel: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#bbb',
    padding: '4px 10px',
    borderRadius: '999px',
    border: '1px dashed #ddd',
    cursor: 'pointer',
  },
  tagPopover: {
    position: 'absolute',
    top: '100%',
    left: '5%',
    right: '5%',
    marginTop: 8,
    padding: 16,
    background: '#fff',
    border: '1px solid #eee',
    borderRadius: 16,
    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
    zIndex: 100,
  },
  popoverHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: 12 },
  popoverTitle: { fontSize: '14px', fontWeight: 800 },
  closeButton: { background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' },
  newTagRow: { display: 'flex', gap: 6, marginBottom: 16 },
  input: { flex: 1, fontSize: '16px', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' },
  addButton: { padding: '0 16px', borderRadius: '8px', border: 'none', background: '#4D96FF', color: '#fff', fontWeight: 700 },
  group: { marginBottom: 12 },
  groupTitle: { fontSize: '11px', fontWeight: 800, color: '#999', marginBottom: 6, textTransform: 'uppercase' },
  tagGrid: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  tagOption: { fontSize: '12px', padding: '5px 12px', borderRadius: '999px', background: '#f5f5f5', cursor: 'pointer' },
  tagActive: { background: '#4D96FF', color: '#fff' },
}