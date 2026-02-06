'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import ReactionEditorModal from './ReactionEditorModal'

type Props = {
  answerId: string
  imageUrl: string | null
  reactionCount: number
  username: string
}

export default function AnswerActionBar({
  answerId,
  imageUrl,
  reactionCount,
  username,
}: Props) {
  const [open, setOpen] = useState(false)

  // 画像がない答案にはリアクションEditorを出さない
  if (!imageUrl) return null

  return (
    <>
      <div style={styles.bar}>
        <button
          style={styles.button}
          onClick={() => setOpen(true)}
        >
          <Heart size={18} />
          <span>{reactionCount} リアクションを追加</span>
        </button>
      </div>

      <ReactionEditorModal
        open={open}
        imageUrl={imageUrl}
        postId={answerId}
        username={username}
        onClose={() => setOpen(false)}
      />
    </>
  )
}

const styles = {
  bar: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#555',
    fontSize: 13,
  },
}
