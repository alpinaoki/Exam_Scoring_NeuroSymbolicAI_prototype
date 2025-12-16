'use client'

import { useState } from 'react'

const problems = [
  { id: 1, image: '/sample1.png' },
  { id: 2, image: '/sample2.png' },
  { id: 3, image: '/sample3.png' },
]

export default function Home() {
  const [index, setIndex] = useState(0)

  const prev = () => {
    if (index > 0) setIndex(index - 1)
  }

  const next = () => {
    if (index < problems.length - 1) setIndex(index + 1)
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.logo}>Magmaweb</h1>
      </header>

      {/* Main */}
      <main style={styles.main}>
        {/* Left Arrow */}
        <button onClick={prev} style={styles.arrow}>
          ‹
        </button>

        {/* Problem Card */}
        <div style={styles.card}>
          <img
            src={problems[index].image}
            alt="problem"
            style={styles.image}
          />

          <button style={styles.submitButton}>
            画像を提出する
          </button>
        </div>

        {/* Right Arrow */}
        <button onClick={next} style={styles.arrow}>
          ›
        </button>
      </main>

      {/* Footer Progress */}
      <footer style={styles.footer}>
        {problems.map((_, i) => (
          <div
            key={i}
            style={{
              ...styles.dot,
              backgroundColor: i === index ? '#c0392b' : '#555',
            }}
          />
        ))}
      </footer>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    backgroundColor: '#111',
    color: '#eee',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    padding: '16px 24px',
    borderBottom: '1px solid #333',
  },
  logo: {
    margin: 0,
    fontSize: '20px',
    letterSpacing: '1px',
  },
  main: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '24px',
  },
  arrow: {
    background: 'none',
    border: 'none',
    color: '#aaa',
    fontSize: '48px',
    cursor: 'pointer',
  },
  card: {
    backgroundColor: '#f5f1e8',
    borderRadius: '12px',
    padding: '16px',
    width: '480px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  image: {
    width: '100%',
    borderRadius: '8px',
    objectFit: 'contain',
  },
  submitButton: {
    backgroundColor: '#c0392b',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '10px 16px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  footer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '6px',
    padding: '12px',
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
}
