'use client'

import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  return (
    <div style={styles.page}>
      <h1>Magmaweb</h1>
      <button onClick={() => router.push('/feed')}>
        ログイン（仮）
      </button>
    </div>
  )
}

const styles = {
  page: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #111, #3b1f1f)',
    color: '#eee',
  },
}
