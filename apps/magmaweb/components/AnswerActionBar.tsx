'use client'

import { useState } from 'react'
import type { CSSProperties } from 'react'
import {
  SmilePlus,
  Heart,
  Star,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react'
import { supabase } from '../lib/supabase'

type ReactionType =
  | 'heart'
  | 'star'
  | 'exclamation'
  | 'question'

type Props = {
  problemId: string // ← 実質 post_id（answer_id）
  reactionCount: number
  rootId: string
}

export default function AnswerActionBar({
  problemId,
  reactionCount,
}: Props) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<ReactionType>('star')
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  async function submitReaction() {
    if (!comment.trim()) return

    try {
      setLoading(true)

      const { data } = await supabase.auth.getUser()
      const user = data.user
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase.from('reactions').insert({
        post_id: problemId,
        user_id: user.id,
        type,
        comment,
        x_float: 0.5, // ★ 今は固定（画像中央）
        y_float: 0.5,
      })

      if (error) throw error

      setComment('')
      setOpen(false)
    } catch (e) {
      console.error(e)
      alert('失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.wrapper}>
      <button
        style={styles.action}
        onClick={() => setOpen((v) => !v)}
      >
        <SmilePlus size={20} />
        <span>リアクション {reactionCount}</span>
      </button>

      {open && (
        <div style={styles.reactionBox}>
          <div style={styles.typePicker}>
            <IconButton
              active={type === 'heart'}
              onClick={() => setType('heart')}
            >
              <Heart size={18} />
            </IconButton>
            <IconButton
              active={type === 'star'}
              onClick={() => setType('star')}
            >
              <Star size={18} />
            </IconButton>
            <IconButton
              active={type === 'exclamation'}
              onClick={() => setType('exclamation')}
            >
              <AlertTriangle size={18} />
            </IconButton>
            <IconButton
              active={type === 'question'}
              onClick={() => setType('question')}
            >
              <HelpCircle size={18} />
            </IconButton>
          </div>

          <input
            style={styles.input}
            placeholder="ここに一言…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={loading}
          />

          <button
            style={styles.submit}
            onClick={submitReaction}
            disabled={loading}
          >
            送信
          </button>
        </div>
      )}
    </div>
  )
}

/* ---------- 小コンポーネント ---------- */

function IconButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        ...styles.iconButton,
        backgroundColor: active ? '#eee' : 'transparent',
      }}
    >
      {children}
    </button>
  )
}

/* ---------- styles ---------- */

const styles: { [key: string]: CSSProperties } = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  action: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'black',
    padding: 0,
    fontSize: 'inherit',
    fontFamily: 'inherit',
    lineHeight: 1,
  },
  reactionBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 12px',
    borderRadius: 8,
    background: 'rgba(255,255,255,0.9)',
    border: '1px solid #ddd',
  },
  typePicker: {
    display: 'flex',
    gap: 4,
  },
  iconButton: {
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    padding: 4,
    borderRadius: 6,
  },
  input: {
    flex: 1,
    padding: '6px 8px',
    borderRadius: 6,
    border: '1px solid #ccc',
    fontSize: 14,
  },
  submit: {
    padding: '6px 10px',
    borderRadius: 6,
    border: 'none',
    background: '#333',
    color: 'white',
    cursor: 'pointer',
    fontSize: 13,
  },
}
