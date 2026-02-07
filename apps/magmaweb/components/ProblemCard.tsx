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

        <div style={styles.actionArea}>
          <ProblemActionBar
            problemId={problemId}
            rootId={problemId}
            answerCount={answerCount}
          />
        </div>

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

        {/* 修正：画面全体を覆う fixed モーダル */}
        {tagOpen && isMine && (
          <div 
            style={styles.modalOverlay} 
            onClick={() => setTagOpen(false)}
          >
            <div 
              style={styles.tagPopover} 
              onClick={(e) => e.stopPropagation()}
            >
              <div style={styles.popoverHeader}>
                <span style={styles.popoverTitle}>タグを編集</span>
                <button style={styles.closeButton} onClick={() => setTagOpen(false)}>✕</button>
              </div>
              
              <div style={styles.scrollContent}>
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
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const styles: { [key: string]: CSSProperties } = {
  cardContainer: {
    padding: '12px 0',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    background: '#fff',
    borderRadius: '24px',
    padding: '16px',
    border: '1px solid #f0f0f0',
    boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
    gap: '14px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '0 4px',
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
    color: '#bbb',
    fontSize: '12px',
  },
  imageWrapper: {
    width: '100%',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '1px solid #f8f8f8',
    backgroundColor: '#fafafa',
  },
  image: {
    width: '100%',
    display: 'block',
    objectFit: 'contain',
    cursor: 'pointer',
  },
  actionArea: {
    background: '#f8f9fa',
    borderRadius: '16px',
    padding: '4px',
  },
  labelRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    padding: '0 4px',
  },
  label: {
    fontSize: '12px',
    fontWeight: 700,
    color: '#777',
    background: '#f0f0f0',
    padding: '5px 12px',
    borderRadius: '999px',
    cursor: 'pointer',
  },
  addLabel: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#bbb',
    padding: '4px 12px',
    borderRadius: '999px',
    border: '1px dashed #ddd',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  // 画面全体を暗くするレイヤー
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  tagPopover: {
    width: '100%',
    maxWidth: '500px',
    maxHeight: '80vh', // 画面の高さ8割までに制限
    padding: '24px',
    background: '#fff',
    borderRadius: '24px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
    display: 'flex',
    flexDirection: 'column',
  },
  // モーダル内をスクロール可能にする
  scrollContent: {
    overflowY: 'auto',
    flex: 1,
    paddingRight: '4px',
  },
  popoverHeader: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    marginBottom: 20,
    flexShrink: 0 
  },
  popoverTitle: { fontSize: '16px', fontWeight: 800 },
  closeButton: { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#ccc' },
  newTagRow: { display: 'flex', gap: 8, marginBottom: 20 },
  input: { flex: 1, fontSize: '16px', padding: '12px', borderRadius: '12px', border: '1px solid #eee', outline: 'none' },
  addButton: { padding: '0 20px', borderRadius: '12px', border: 'none', background: '#4D96FF', color: '#fff', fontWeight: 700 },
  group: { marginBottom: 20 },
  groupTitle: { fontSize: '11px', fontWeight: 800, color: '#aaa', marginBottom: 10, letterSpacing: '0.05em' },
  tagGrid: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  tagOption: { fontSize: '12px', padding: '8px 16px', borderRadius: '999px', background: '#f5f5f5', color: '#666', cursor: 'pointer', fontWeight: 600 },
  tagActive: { background: '#4D96FF', color: '#fff' },
}