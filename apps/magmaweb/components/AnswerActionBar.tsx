'use client'

import { useState } from 'react'
import type { CSSProperties } from 'react'
import { Heart } from 'lucide-react'
import ReactionModal from './ReactionModal'

type Props = {
  problemId: string
  reactionCount: number
  imageUrl: string
}

export default function AnswerActionBar({
  problemId,
  reactionCount,
  imageUrl,
}: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div style={styles.wrapper}>
      {/* ❤️ リアクションボタン */}
      <button
        style={styles.heartBtn}
        onClick={() => setOpen(true)}
      >
        <Heart size={20} />
        <span style={styles.count}>
          リアクション {reactionCount}
        </span>
      </button>

      {/* Reaction 投稿モーダル */}
      <ReactionModal
        open={open}
        imageUrl={imageUrl}
        postId={problemId}
        onClose={() => setOpen(false)}
      />
    </div>
  )
}

const styles: { [key: string]: CSSProperties } = {
  wrapper: {
    display: 'flex',
    alignItems: 'center',
  },
  heartBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px 0',
    fontWeight: 600,
    color: '#666',
  },
  count: {
    fontSize: 14,
  },
}
