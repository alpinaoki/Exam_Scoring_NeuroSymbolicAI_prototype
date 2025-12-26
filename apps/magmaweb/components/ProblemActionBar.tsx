'use client'

import type { CSSProperties } from 'react'

type Props = {
  bookmarkCount?: number
  answerCount?: number
}

export default function ProblemActionBar({
  bookmarkCount = 0,
  answerCount = 0,
}: Props) {
  return (
    <div style={styles.bar}>
      <div style={styles.item}>
        🔖 <span>{bookmarkCount}</span>
      </div>

      <label style={styles.item}>
        ✏ <span>{answerCount}</span>
        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
        />
      </label>
    </div>
  )
}

const styles: { [key: string]: CSSProperties } = {
  bar: {
    display: 'flex',
    gap: '16px',
    fontSize: '14px',
    color: '#555',
    alignItems: 'center',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    cursor: 'pointer',
  },
}
