'use client'

import { useRouter } from 'next/navigation'
import type { CSSProperties } from 'react'

export default function LoginPage() {
  const router = useRouter()

  return (
    <div style={styles.page}>
      <h1>Magmathe</h1>
      <button onClick={() => router.push('/feed')}>
        ログイン（仮）
      </button>
    </div>
  )
}

const styles: { [key: string]: CSSProperties } = {
  page: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #111, #3B1F1F)',
    color: '#eee',
  },
}