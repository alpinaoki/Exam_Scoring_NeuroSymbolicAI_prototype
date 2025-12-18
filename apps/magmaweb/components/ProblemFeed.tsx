'use client'

import type { CSSProperties } from 'react'
import { problems } from '../data/problems'
import ProblemCard from './ProblemCard'

export default function ProblemFeed() {
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {problems.map((p) => (
          <ProblemCard key={p.id} image={p.image} />
        ))}
      </div>
    </div>
  )
}

const styles: { [key: string]: CSSProperties } = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#fff',
    display: 'flex',
    justifyContent: 'center',
  },
  container: {
    width: '100%',
    maxWidth: '420px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
}
