'use client'

import { useState } from 'react'
import type { CSSProperties } from 'react'
import {
  Heart,
  Star,
  AlertTriangle,
  HelpCircle,
  SendHorizontal
} from 'lucide-react'
import { supabase } from '../lib/supabase'

// Heartを削除し3種類に
type ReactionType = 'star' | 'exclamation' | 'question'

type Props = {
  problemId: string
  reactionCount: number
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
        x_float: 0.5,
        y_float: 0.5,
      })

      if (error) throw error

      setComment('')
      setOpen(false)
    } catch (e) {
      console.error(e)
      alert('送信に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.wrapper}>
      {/* メインのアクションボタン */}
      <button
        style={{
          ...styles.action,
          color: open ? '#ff8c00' : '#888' // 開いているときは色を変える
        }}
        onClick={() => setOpen((v) => !v)}
      >
        <Heart size={20} />
        <span style={styles.countText}>リアクション {reactionCount}</span>
      </button>

      {open && (
        <div style={styles.reactionBox}>
          {/* アイコン選択エリア */}
          <div style={styles.typePicker}>
            <IconButton
              active={type === 'star'}
              label="なるほど"
              onClick={() => setType('star')}
            >
              <Star size={18} fill={type === 'star' ? '#ff8c00' : 'none'} color={type === 'star' ? '#ff8c00' : '#666'} />
            </IconButton>
            
            <IconButton
              active={type === 'exclamation'}
              label="すごい！"
              onClick={() => setType('exclamation')}
            >
              <AlertTriangle size={18} color={type === 'exclamation' ? '#ff8c00' : '#666'} />
            </IconButton>
            
            <IconButton
              active={type === 'question'}
              label="もっと詳しく"
              onClick={() => setType('question')}
            >
              <HelpCircle size={18} color={type === 'question' ? '#ff8c00' : '#666'} />
            </IconButton>
          </div>

          {/* 入力エリア */}
          <div style={styles.inputContainer}>
            <input
              style={styles.input}
              placeholder="一言メッセージを送る..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.nativeEvent.isComposing) submitReaction()
              }}
            />
            <button
              style={{
                ...styles.submit,
                opacity: comment.trim() && !loading ? 1 : 0.4
              }}
              onClick={submitReaction}
              disabled={loading || !comment.trim()}
            >
              <SendHorizontal size={18} />
            </button>
          </div>
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
  label
}: {
  children: React.ReactNode
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        ...styles.iconButton,
        backgroundColor: active ? 'rgba(255, 140, 0, 0.1)' : 'transparent',
        borderColor: active ? '#ff8c00' : 'transparent',
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
    gap: 12,
    marginTop: 8,
  },
  action: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px 8px',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'all 0.2s',
  },
  countText: {
    color: '#666',
  },
  reactionBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    padding: '12px',
    borderRadius: '16px',
    background: 'rgba(255, 255, 255, 0.95)',
    border: '1px solid rgba(0, 0, 0, 0.08)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
    maxWidth: '350px',
  },
  typePicker: {
    display: 'flex',
    gap: 8,
    justifyContent: 'flex-start',
  },
  iconButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid transparent',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '10px',
    transition: 'all 0.2s ease',
  },
  inputContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: '#f5f5f7',
    borderRadius: '12px',
    padding: '4px 4px 4px 12px',
  },
  input: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    padding: '8px 0',
    fontSize: '14px',
    outline: 'none',
    color: '#333',
  },
  submit: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px',
    borderRadius: '8px',
    border: 'none',
    background: '#333',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
}