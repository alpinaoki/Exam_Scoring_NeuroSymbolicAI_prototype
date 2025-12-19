'use client'

import type { CSSProperties } from 'react'
import ProblemActionBar from './ProblemActionBar'

type Props = {
  image: string
}

export default function ProblemCard({ image }: Props) {
  return (
    <div style={styles.card}>
      <img src={image} alt="problem" style={styles.image} />

      <ProblemActionBar
        bookmarkCount={12}
        answerCount={3}
      />
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
}







