'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { CSSProperties } from 'react'
import { signIn, signUp } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    setError(null)
    try {
      if (mode === 'login') {
        await signIn(username, password)
      } else {
        await signUp(username, password)
      }
      router.push('/feed')
    } catch (e: any) {
      setError(e.message ?? 'エラーが発生しました')
    }
  }

  return (
    <div style={styles.page}>
      <h1>Magmathe</h1>

      <input
        placeholder="ユーザー名"
        value={username}
        onChange={e => setUsername(e.target.value)}
        style={styles.input}
      />

      <input
        type="password"
        placeholder="パスワード"
        value={password}
        onChange={e => setPassword(e.target.value)}
        style={styles.input}
      />

      {error && <p style={styles.error}>{error}</p>}

      <button onClick={handleSubmit}>
        {mode === 'login' ? 'ログイン' : 'サインアップ'}
      </button>

      <button
        style={styles.switch}
        onClick={() =>
          setMode(mode === 'login' ? 'signup' : 'login')
        }
      >
        {mode === 'login'
          ? '初めての方はこちら'
          : 'ログインはこちら'}
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
    gap: 12,
  },
  input: {
    padding: 8,
    borderRadius: 4,
    border: '1px solid #444',
    background: '#111',
    color: '#eee',
  },
  error: {
    color: '#f66',
  },
  switch: {
    marginTop: 8,
    background: 'none',
    color: '#aaa',
  },
}
