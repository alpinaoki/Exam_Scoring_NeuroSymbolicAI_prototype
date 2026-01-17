'use client'
import type { CSSProperties } from 'react'
import { SmilePlus } from 'lucide-react'


type Props = {
  problemId: string
  reactionCount: number
  rootId: string
  onReact?: () => void
}

export default function AnswerActionBar({
  reactionCount,
  onReact,
}: Props) {
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
