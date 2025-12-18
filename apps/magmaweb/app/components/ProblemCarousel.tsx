'use client'
import { useState } from 'react'
import type { CSSProperties } from 'react'
import { problems } from '../data/problems'
export default function ProblemCarousel() {
  const [index, setIndex] = useState(0)
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <img
          src={problems[index].image}
          alt="problem"
          style={styles.image}
        />
        <button style={styles.submit}>
          画像を提出する
        </button>
        {/* progress dots */}
        <div style={styles.dots}>
          {problems.map((_, i) => (
            <span
              key={i}
              style={{
                ...styles.dot,
                opacity: i === index ? 1 : 0.3,
              }}
            />
          ))}
        </div>
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
    maxWidth: '420px', // ← インスタ幅
    padding: '16px',
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
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  dots: {
    display: 'flex',
    justifyContent: 'center',
    gap: '6px',
    marginTop: '8px',
  },
  dot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#999',
  },
}
