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
      {/* ここにアニメーションの定義を追加 */}
      <style>{`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@200&display=swap');
  
  @keyframes pulse {
    0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.4; }
    100% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
  }
`}</style>

      {/* アニメーションを適用した背景のボケ */}
      <div style={styles.blob}></div>

      <div style={styles.card}>
        <header style={styles.header}>
          <h1 style={styles.title}>MAGMATHE</h1>
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
    // 背景自体も少しだけ明るい赤みを混ぜる
    background: 'radial-gradient(circle at center, #1e1111 0%, #050505 100%)',
    color: '#eee',
    position: 'relative',
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    // 画面全体に広がるサイズ感に
    width: '100vw',
    height: '100vw',
    // 色を少し強める
    background: 'radial-gradient(circle, rgba(255, 60, 0, 0.25) 0%, transparent 60%)',
    filter: 'blur(100px)',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)', // ここで位置を固定
    zIndex: 0,
    animation: 'pulse 10s ease-in-out infinite alternate',
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    padding: '48px 40px',
    borderRadius: '28px',
    background: 'rgba(30, 30, 30, 0.4)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    zIndex: 1,
    textAlign: 'center',
  },
  header: {
    marginBottom: '40px',
  },
  title: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '38px',
    fontWeight: 200,
    letterSpacing: '10px', 
    textTransform: 'uppercase',
    margin: '0 0 8px 0',
    paddingLeft: '10px', 
    background: 'linear-gradient(180deg, #fff 0%, #ff4d00 100%)',
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
    boxSizing: 'border-box',
  },
  button: {
    marginTop: '8px',
    padding: '14px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #ad5a71, #b9a088)',
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