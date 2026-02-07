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

        {/* 修正：下端の重なりを防ぐ fixed モーダル */}
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
  // ProblemCard.tsx 内の styles.card を以下のように更新
card: {
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  background: '#fff',
  borderRadius: '24px',
  padding: '16px',
  border: '1px solid rgba(0,0,0,0.05)', // 線をより繊細に
  boxShadow: '0 4px 20px rgba(0,0,0,0.03)', // 柔らかい影
  gap: '14px',
  marginBottom: '16px', // カード同士の隙間をしっかり取る
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
    color: '#4D96FF',
    background: '#F0F7FF',
    padding: '5px 14px',
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
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.6)', // 少し暗めにして集中させる
    display: 'flex',
    alignItems: 'flex-start', // 中央ではなく上寄りに配置
    justifyContent: 'center',
    zIndex: 2000, // ナビバーより確実に上に
    padding: '60px 20px 100px 20px', // 上下の余白を広めにとる
  },
  tagPopover: {
    width: '100%',
    maxWidth: '500px',
    maxHeight: '75vh', // 下端が被らないよう少し短めに
    padding: '24px',
    background: '#fff',
    borderRadius: '28px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  scrollContent: {
    overflowY: 'auto',
    flex: 1,
    paddingRight: '4px',
    WebkitOverflowScrolling: 'touch', // iOSのスクロールを滑らかに
  },
  popoverHeader: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 20,
    flexShrink: 0 
  },
  popoverTitle: { fontSize: '18px', fontWeight: 800, color: '#333' },
  closeButton: { background: '#f5f5f5', border: 'none', width: '32px', height: '32px', borderRadius: '50%', fontSize: '16px', cursor: 'pointer', color: '#999', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  newTagRow: { display: 'flex', gap: 10, marginBottom: 24 },
  input: { flex: 1, fontSize: '16px', padding: '14px', borderRadius: '16px', border: '2px solid #f0f0f0', outline: 'none', background: '#fafafa' },
  addButton: { padding: '0 20px', borderRadius: '16px', border: 'none', background: '#4D96FF', color: '#fff', fontWeight: 800, cursor: 'pointer' },
  group: { marginBottom: 24 },
  groupTitle: { fontSize: '12px', fontWeight: 800, color: '#bbb', marginBottom: 12, letterSpacing: '0.05em', paddingLeft: '4px' },
  tagGrid: { display: 'flex', flexWrap: 'wrap', gap: 10 },
  tagOption: { fontSize: '13px', padding: '10px 18px', borderRadius: '999px', background: '#f5f5f5', color: '#555', cursor: 'pointer', fontWeight: 600, transition: 'all 0.1s' },
  tagActive: { background: '#4D96FF', color: '#fff', boxShadow: '0 4px 12px rgba(77, 150, 255, 0.3)' },
}