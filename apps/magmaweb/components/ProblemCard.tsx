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
        {/* ヘッダー：ユーザー情報 */}
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

        {/* メイン：問題画像 */}
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

        {/* 重要アクション：解答バー（背景をつけて独立性を高める） */}
        <div style={styles.actionArea}>
          <ProblemActionBar
            problemId={problemId}
            rootId={problemId}
            answerCount={answerCount}
          />
        </div>

        {/* フッター：タグ（少し控えめにして情報を整理） */}
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
    background: '#f8f9fa', // ほんのりグレーで区切る
    borderRadius: '16px',
    padding: '4px', // ProblemActionBar側のpaddingと合わせて調整
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
    color: '#777', // タグは少し控えめな色にして、アクションを優先させる
    background: '#f0f0f0',
    padding: '5px 12px',
    borderRadius: '999px',
    cursor: 'pointer',
    transition: 'all 0.2s',
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
  tagPopover: {
    position: 'absolute',
    bottom: '20px', // 下に表示されると隠れる場合があるため、状況により調整
    left: '12px',
    right: '12px',
    padding: '20px',
    background: '#fff',
    border: '1px solid #eee',
    borderRadius: '20px',
    boxShadow: '0 15px 40px rgba(0,0,0,0.2)',
    zIndex: 100,
  },
  popoverHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: 16 },
  popoverTitle: { fontSize: '15px', fontWeight: 800 },
  closeButton: { background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#ccc' },
  newTagRow: { display: 'flex', gap: 8, marginBottom: 20 },
  input: { flex: 1, fontSize: '16px', padding: '12px', borderRadius: '12px', border: '1px solid #eee', outline: 'none' },
  addButton: { padding: '0 20px', borderRadius: '12px', border: 'none', background: '#4D96FF', color: '#fff', fontWeight: 700 },
  group: { marginBottom: 16 },
  groupTitle: { fontSize: '11px', fontWeight: 800, color: '#aaa', marginBottom: 8, letterSpacing: '0.05em' },
  tagGrid: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  tagOption: { fontSize: '12px', padding: '6px 14px', borderRadius: '999px', background: '#f5f5f5', color: '#666', cursor: 'pointer', fontWeight: 600 },
  tagActive: { background: '#4D96FF', color: '#fff' },
}