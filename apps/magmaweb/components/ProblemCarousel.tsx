'use client'
import type { CSSProperties } from 'react'
import { problems } from '../data/problems'
export default function ProblemCarousel() {
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {problems.map((p) => (
          <div key={p.id} style={styles.card}>
            <img
              src={p.image}
              alt="problem"
              style={styles.image}
            />
            <button style={styles.submit}>
              画像を提出する
            </button>
          </div>
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
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
  },
}