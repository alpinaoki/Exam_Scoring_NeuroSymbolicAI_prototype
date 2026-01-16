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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@200&display=swap');
        
        @keyframes flow {
          0% { transform: translate(-10%, -10%) scale(1); opacity: 0.3; }
          50% { transform: translate(10%, 10%) scale(1.2); opacity: 0.6; }
          100% { transform: translate(-10%, -10%) scale(1); opacity: 0.3; }
        }
      `}</style>

      {/* 2つの巨大な光の層 */}
      <div style={styles.blob}></div>
      <div style={{...styles.blob, ...styles.blob2}}></div>

      <div style={styles.card}></div>

      {/* アニメーションを適用した背景のボケ */}

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
    // 全体的に少し赤みのある黒に
    background: '#0d0202',
    color: '#eee',
    position: 'relative',
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    width: '120vw', // 画面より大きく
    height: '120vw',
    // オレンジと赤の混ざった光
    background: 'radial-gradient(circle, rgba(255, 40, 0, 0.2) 0%, transparent 60%)',
    filter: 'blur(80px)',
    top: '-20%',
    left: '-20%',
    zIndex: 0,
    animation: 'flow 15s ease-in-out infinite',
  },
  blob2: {
    // もう一つの光を右下に配置して、画面全体を照らす
    top: 'auto',
    left: 'auto',
    bottom: '-20%',
    right: '-20%',
    background: 'radial-gradient(circle, rgba(255, 100, 0, 0.15) 0%, transparent 60%)',
    animationDuration: '20s',
    animationDirection: 'reverse',
  },
  card: {
    width: '90%', // モバイルで見やすいように
    maxWidth: '400px',
    padding: '48px 32px',
    borderRadius: '32px',
    // ここがポイント：透明度を下げて背後の光を通す
    background: 'rgba(255, 255, 255, 0.03)', 
    backdropFilter: 'blur(30px)', // ガラスのボケを強く
    WebkitBackdropFilter: 'blur(30px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.8)',
    zIndex: 1,
    textAlign: 'center',
  },
  header: {
    marginBottom: '40px',
  },
  title: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '42px', // 少し大きく
    fontWeight: 200,
    letterSpacing: '12px', 
    textTransform: 'uppercase',
    margin: '0 0 8px 0',
    paddingLeft: '12px', 
    background: 'linear-gradient(180deg, #fff 20%, #ff5500 100%)',
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