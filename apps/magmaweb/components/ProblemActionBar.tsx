'use client'

import type { CSSProperties } from 'react'

type Props = {
  bookmarkCount: number
  answerCount: number
  onSelectImage: (file: File) => void
}

export default function ProblemActionBar({
  bookmarkCount,
  answerCount,
  onSelectImage,
}: Props) {
  return (
    <div style={styles.bar}>
      <span>:しおり: {bookmarkCount}</span>

      <label style={styles.comment}>
        :入力中アイコン: {answerCount}
        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onSelectImage(file)
          }}
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
  },
  comment: {
    cursor: 'pointer',
  },
}
