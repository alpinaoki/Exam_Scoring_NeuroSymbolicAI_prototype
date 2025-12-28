'use client'

import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { problems as allProblems } from '../data/problems'
import ProblemCard from './ProblemCard'

const PAGE_SIZE = 5

export default function ProblemFeed() {
  const [visible, setVisible] = useState(PAGE_SIZE)
  const loaderRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible((v) =>
            Math.min(v + PAGE_SIZE, allProblems.length)
          )
        }
      },
      { threshold: 0.1 }
    )

    if (loaderRef.current) observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {allProblems.slice(0, visible).map((p) => (
          <ProblemCard key={p.id} image={p.image} problemId={String(p.id)}/>
        ))}

        {/* ローダー */}
        <div ref={loaderRef} style={styles.loader}>
          読み込み中…
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
    maxWidth: '420px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  loader: {
    textAlign: 'center',
    color: '#999',
    padding: '16px',
    fontSize: '14px',
  },
}
