'use client'

import type { CSSProperties } from 'react'
import { SmilePlus } from 'lucide-react'
import { createReaction } from '../lib/reactions'

type Props = {
  problemId: string
  reactionCount: number
}

export default function AnswerActionBar({
  problemId,
  reactionCount,
}: Props) {
  const onReact = async () => {
    const comment = window.prompt('リアクションにこめた意味...')
    if (!comment) return

    try {
      await createReaction({
        postId: problemId,
        type: 'star',
        comment,
      })
      alert('リアクションを追加しました')
    } catch (e) {
      console.error(e)
      alert('失敗しました')
    }
  }

  return (
    <div style={styles.bar}>
      <button style={styles.action} onClick={onReact}>
        <SmilePlus size={20} />
        <span>リアクション {reactionCount}</span>
      </button>
    </div>
  )
}


const styles: { [key: string]: CSSProperties } = {
  bar: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    color: 'black',
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
}
