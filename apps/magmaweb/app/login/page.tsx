'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { CSSProperties } from 'react'
import { signIn, signUp } from '../../lib/auth'
import { LogIn, UserPlus, AlertCircle } from 'lucide-react' // アイコン追加

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
      {/* 装飾用の背景のボケ */}
      <div style={styles.blob}></div>

      <div style={styles.card}>
        <header style={styles.header}>
          <h1 style={styles.title}>Magmathe</h1>
          <p style={styles.subtitle}>
            {mode === 'login' ? 'おかえりなさい' : '新しいアカウントを作成'}
          </p>
        </header>

        <div style={styles.form}>
          <div style={styles.inputGroup}>
            <input
              placeholder="ユーザー名"
              value={username}
              onChange={e => setUsername(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <input
              type="password"
              placeholder="パスワード"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={styles.input}
            />
          </div>

          {error && (
            <div style={styles.errorBox}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <button 
            onClick={handleSubmit} 
            disabled={loading}
            style={loading ? {...styles.button, opacity: 0.7} : styles.button}
          >
            {loading ? '処理中...' : (
              <div style={styles.buttonInner}>
                {mode === 'login' ? <LogIn size={18} /> : <UserPlus size={18} />}
                <span>{mode === 'login' ? 'ログイン' : 'サインアップ'}</span>
              </div>
            )}
          </button>
        </div>

        <button
          style={styles.switch}
          onClick={() => {
            setError(null)
            setMode(mode === 'login' ? 'signup' : 'login')
          }}
        >
          {mode === 'login'
            ? '初めての方はこちら：サインアップ'
            : '既にアカウントをお持ちの方：ログイン'}
        </button>
      </div>
    </div>
  )
}

const styles: { [key: string]: CSSProperties } = {
  page: {
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#0a0a0a', // 真っ黒に近い背景
    color: '#eee',
    position: 'relative',
    overflow: 'hidden',
  },
  // 背景に浮かぶマグマのような光
  blob: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    background: 'radial-gradient(circle, rgba(255, 69, 0, 0.15) 0%, transparent 70%)',
    filter: 'blur(50px)',
    zIndex: 0,
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    padding: '40px',
    borderRadius: '24px',
    background: 'rgba(20, 20, 20, 0.8)',
    backdropFilter: 'blur(12px)', // グラスモーフィズム
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
    zIndex: 1,
    textAlign: 'center',
  },
  header: {
    marginBottom: '32px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '800',
    letterSpacing: '-1px',
    margin: '0 0 8px 0',
    background: 'linear-gradient(to right, #ff4d00, #ff8c00)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    color: '#888',
    fontSize: '14px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  inputGroup: {
    width: '100%',
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '12px',
    border: '1px solid #333',
    background: '#1a1a1a',
    color: '#fff',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  },
  button: {
    marginTop: '8px',
    padding: '14px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #ce7d5f, #e3ccb9)', // マグマ・グラデーション
    color: '#fff',
    fontWeight: '600',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'transform 0.1s, box-shadow 0.2s',
  },
  buttonInner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#ff6b6b',
    fontSize: '13px',
    background: 'rgba(255, 107, 107, 0.1)',
    padding: '10px',
    borderRadius: '8px',
    textAlign: 'left',
  },
  switch: {
    marginTop: '24px',
    background: 'none',
    border: 'none',
    color: '#666',
    fontSize: '13px',
    cursor: 'pointer',
    textDecoration: 'underline',
    textUnderlineOffset: '4px',
  },
}