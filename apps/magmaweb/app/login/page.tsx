'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { CSSProperties } from 'react'
import { signIn, signUp } from '../../lib/auth'
import TermsOfUse from '../../components/TermsOfUse'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    setError(null)

    if (mode === 'signup' && !agreed) {
      setError('利用規約への同意が必要です')
      return
    }

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

      {/* サインアップ時のみ表示 */}
      {mode === 'signup' && (
        <div style={styles.termsBox}>
          <TermsOfUse />
          <label style={styles.checkbox}>
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
            />
            <span>
              上記内容を理解し、記述答案データを研究目的で利用することに同意します
            </span>
          </label>
        </div>
      )}

      {error && <p style={styles.error}>{error}</p>}

      <button onClick={handleSubmit}>
        {mode === 'login' ? 'ログイン' : 'サインアップ'}
      </button>

      <button
        style={styles.switch}
        onClick={() => {
          setMode(mode === 'login' ? 'signup' : 'login')
          setAgreed(false)
          setError(null)
        }}
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
  termsBox: {
    maxWidth: 320,
    maxHeight: 160,
    overflowY: 'auto',
    border: '1px solid #444',
    padding: 8,
    borderRadius: 4,
    background: '#0d0d0d',
  },
  checkbox: {
    display: 'flex',
    gap: 6,
    marginTop: 8,
    fontSize: 12,
  },
}
