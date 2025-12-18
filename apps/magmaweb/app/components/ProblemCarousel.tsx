'use client'

import { useState } from 'react'
import { problems } from '../data/problems'

export default function ProblemCarousel() {
  const [index, setIndex] = useState(0)

  return (
    <div style={styles.main}>
      <button onClick={() => setIndex(Math.max(0, index - 1))}>‹</button>

      <div style={styles.card}>
        <img src={problems[index].image} style={styles.image} />
        <button>画像を提出する</button>
      </div>

      <button
        onClick={() =>
          setIndex(Math.min(problems.length - 1, index + 1))
        }
      >
        ›
      </button>
    </div>
  )
}

const styles = {
  main: { display: 'flex', alignItems: 'center', gap: '20px' },
  card: { background: '#f5f1e8', padding: '16px' },
  image: { width: '400px' },
}
