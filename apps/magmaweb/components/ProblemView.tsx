'use client'

import type { CSSProperties } from 'react'

type Props = {
  image: string | null
  username: string
}

export default function ProblemView({ image, username }: Props) {
  return (
    <div style={styles.card}>
      <div style={styles.username}>@{username}</div>

      {image && (
        <img
          src={image}
          alt="problem"
          style={styles.image}
        />
      )}
    </div>
  )
}

const styles: { [key: string]: CSSProperties } = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  image: {
    width: '100%',
    borderRadius: '8px',
    objectFit: 'contain',
    border: '1px solid #eee',
  },
  username: {
    fontSize: '13px',
    color: '#555',
  },
}
