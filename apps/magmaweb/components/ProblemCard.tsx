'use client'

import type { CSSProperties } from 'react'

type Props = {
  image: string
}

export default function ProblemCard({ image }: Props) {
  return (
    <div style={styles.card}>
      <img src={image} alt="problem" style={styles.image} />

      <label style={styles.submit}>
        画像を提出する
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
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  image: {
    width: '100%',
    borderRadius: '8px',
    objectFit: 'contain',
    border: '1px solid #eee',
  },
  submit: {
    padding: '12px',
    backgroundColor: '#e53935',
    color: '#fff',
    borderRadius: '8px',
    fontSize: '16px',
    textAlign: 'center',
    cursor: 'pointer',
  },
}
