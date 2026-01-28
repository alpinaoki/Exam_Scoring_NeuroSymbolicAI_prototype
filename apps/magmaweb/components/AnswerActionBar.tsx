'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import ReactionEditorModal from './ReactionEditorModal'

type Props = {
  answerId: string
  imageUrl: string | null
  reactionCount: number
}

export default function AnswerActionBar({
  answerId,
  imageUrl,
  reactionCount,
}: Props) {
  const [open, setOpen] = useState(false)

  if (!imageUrl) return null

  return (
    <>
      <div style={styles.bar}>
        <button style={styles.button} onClick={() => setOpen(true)}>
          <Star size={18} />
          <span>{reactionCount}</span>
        </button>
      </div>

      <ReactionEditorModal
        open={open}
        postId={answerId}
        imageUrl={imageUrl}
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