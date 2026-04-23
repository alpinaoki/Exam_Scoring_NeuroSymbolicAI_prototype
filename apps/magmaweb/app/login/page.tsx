'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { CSSProperties } from 'react'
import { signIn, signUp } from '../../lib/auth'
import { LogIn, UserPlus, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setError(null)
    setLoading(true)
    try {
      if (mode === 'login') {
        await signIn(username, password)
      } else {
        await signUp(username, password)
      }
      router.push('/feed')
    } catch (e: any) {
      setError(e.message ?? 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>

      {/* ⭐ ビジュアル */}
      <div style={styles.hero}>
        <img src="/tutorial.png" style={styles.image} />
      </div>

      {/* ⭐ イラスト付きカード */}
      <div style={styles.slider}>

        <div style={styles.card}>
          <div style={styles.illus}>✍️</div>
          <p>解き方が見れる</p>
        </div>

        <div style={styles.card}>
          <div style={styles.illus}>❌</div>
          <p>間違いも価値になる</p>
        </div>

        <div style={styles.card}>
          <div style={styles.illus}>⭐️</div>
          <p>大事な部分が分かる</p>
        </div>

      </div>

      <div style={styles.hint}>← スワイプ →</div>

      {/* ⭐ ログイン */}
      <div style={styles.login}>
        <h1 style={styles.title}>Magmathe</h1>

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

        {error && (
          <div style={styles.errorBox}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <button onClick={handleSubmit} style={styles.button}>
          {loading ? '処理中...' : (
            <div style={styles.buttonInner}>
              {mode === 'login' ? <LogIn size={18} /> : <UserPlus size={18} />}
              <span>{mode === 'login' ? 'ログイン' : '登録'}</span>
            </div>
          )}
        </button>

        <button
          style={styles.switch}
          onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
        >
          {mode === 'login'
            ? 'はじめての方はこちら'
            : 'ログインはこちら'}
        </button>
      </div>
    </div>
  )
}

const styles: { [key: string]: CSSProperties } = {
  page: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: '#eef3f6',
    fontFamily: 'sans-serif',
  },

  hero: {
    display: 'flex',
    justifyContent: 'center',
    paddingTop: '20px',
  },

  image: {
    width: '70%',
    maxWidth: '280px',
  },

  slider: {
    display: 'flex',
    overflowX: 'auto',
    gap: '12px',
    padding: '16px',
  },

  card: {
    minWidth: '140px',
    padding: '14px',
    borderRadius: '12px',
    background: '#f4f7f9',
    textAlign: 'center',
    flexShrink: 0,
  },

  illus: {
    fontSize: '28px',
    marginBottom: '8px',
  },

  hint: {
    textAlign: 'center',
    fontSize: '12px',
    color: '#666',
  },

  login: {
    padding: '20px',
    background: '#fff',
    marginTop: 'auto',
  },

  title: {
    textAlign: 'center',
    marginBottom: '10px',
  },

  input: {
    width: '100%',
    padding: '10px',
    marginBottom: '10px',
    borderRadius: '8px',
    border: '1px solid #ccc',
  },

  button: {
    width: '100%',
    padding: '12px',
    background: '#6c8ea4',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
  },

  buttonInner: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
  },

  errorBox: {
    color: 'red',
    fontSize: '12px',
  },

  switch: {
    marginTop: '10px',
    background: 'none',
    border: 'none',
    width: '100%',
  },
}