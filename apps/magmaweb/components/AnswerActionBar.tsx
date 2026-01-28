'use client'

import { useState, useEffect } from 'react'
import type { CSSProperties } from 'react'
import { Heart } from 'lucide-react'
import ReactionModal from './ReactionModal'

type ReactionType = 'star' | 'exclamation' | 'question'

type Preview = {
  x: number
  y: number
  type: ReactionType
  isDragging?: boolean
}

type Props = {
  problemId: string
  reactionCount: number
  onPreviewChange: (p: Preview | null) => void
}

export default function AnswerActionBar({
  problemId,
  reactionCount,
  onPreviewChange,
}: Props) {
  const [open, setOpen] = useState(false)
  const [preview, setPreview] = useState<Preview | null>(null)

  // preview を親（AnswerCard）に同期
  useEffect(() => {
    onPreviewChange(preview)
  }, [preview, onPreviewChange])

  return (
    <div style={{ position: 'relative' }}>
      {/* ハートボタン */}
      <button
        style={styles.heartBtn}
        onClick={() => {
          setOpen((v) => !v)
          setPreview(null)
        }}
      >
        <Heart
          size={20}
          fill={open ? '#ff8c00' : 'none'}
          color={open ? '#ff8c00' : '#888'}
        />
        <span style={styles.countText}>
          リアクション {reactionCount}
        </span>
      </button>

      {/* モーダル本体 */}
      {open && (
        <ReactionModal
          problemId={problemId}
          onClose={() => {
            setOpen(false)
            setPreview(null)
          }}
          onPreviewChange={setPreview}
        />
      )}
    </div>
  )
}

const styles: { [key: string]: CSSProperties } = {
  heartBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px 0',
    fontWeight: 600,
  },
  countText: {
    color: '#666',
    fontSize: '14px',
  },
}
