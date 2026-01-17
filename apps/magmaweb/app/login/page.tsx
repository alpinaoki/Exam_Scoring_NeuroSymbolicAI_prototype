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
        @keyframes flow {
          0% { transform: translate(-10%, -10%) scale(1); opacity: 0.4; }
          50% { transform: translate(10%, 15%) scale(1.1); opacity: 0.7; }
          100% { transform: translate(-10%, -10%) scale(1); opacity: 0.4; }
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 15px rgba(255, 204, 0, 0.2); }
          50% { box-shadow: 0 0 30px rgba(255, 0, 98, 0.4); }
          100% { box-shadow: 0 0 15px rgba(255, 115, 0, 0.2); }
        }
      `}</style>

      {/* 背景の動的な光の演出 */}
      <div style={styles.blob}></div>
      <div style={{...styles.blob, ...styles.blob2}}></div>
      <div style={{...styles.blob, ...styles.blob3}}></div>

      <div style={styles.card}>
        <header style={styles.header}>
          <h1 style={styles.titleContainer}>
            {"MAGMATHE".split("").map((char, i) => (
              <span key={i} style={styles.titleChar}>{char}</span>
            ))}
          </h1>
          <p style={styles.subtitle}>
            {mode === 'login' ? 'おかえりなさい' : '新しい物語を始めましょう'}
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
                <span>{mode === 'login' ? 'ログイン' : 'アカウント作成'}</span>
              </div>
            )}
          </button>

          {mode === 'signup' && (
            <p style={styles.terms}>
              登録することで、<a href="/terms" style={styles.link}>利用規約</a>と
              <a href="/privacy" style={styles.link}>プライバシーポリシー</a>に同意したことになります。
            </p>
          )}
        </div>

        <button
          style={styles.switch}
          onClick={() => {
            setError(null)
            setMode(mode === 'login' ? 'signup' : 'login')
          }}
        >
          {mode === 'login'
            ? 'まだ登録がお済みでない方はこちら'
            : '既にアカウントをお持ちの方はこちら'}
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
    /* 真っ黒から深みのある赤褐色へのグラデーション */
    background: 'radial-gradient(circle at center, #2c0520 0%, #0f0505 100%)',
    color: '#eee',
    position: 'relative',
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    width: '100vw',
    height: '100vw',
    background: 'radial-gradient(circle, rgba(255, 0, 166, 0.15) 0%, transparent 70%)',
    filter: 'blur(60px)',
    top: '-30%',
    left: '-10%',
    zIndex: 0,
    animation: 'flow 18s ease-in-out infinite',
  },
  blob2: {
    top: '20%',
    left: '40%',
    background: 'radial-gradient(circle, rgba(139, 0, 67, 0.2) 0%, transparent 60%)',
    animationDuration: '25s',
    animationDirection: 'reverse',
  },
  blob3: {
    bottom: '-20%',
    right: '-10%',
    background: 'radial-gradient(circle, rgba(255, 140, 0, 0.1) 0%, transparent 70%)',
    animationDuration: '20s',
  },
  card: {
    width: '92%',
    maxWidth: '420px',
    padding: '56px 32px',
    borderRadius: '40px',
    /* 背景を少し明るい半透明にして、背後の赤褐色を透かす */
    background: 'rgba(30, 10, 10, 0.4)', 
    backdropFilter: 'blur(25px)',
    WebkitBackdropFilter: 'blur(25px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
    zIndex: 1,
    textAlign: 'center',
    boxSizing: 'border-box',
    animation: 'pulse 5s infinite ease-in-out',
  },
  header: {
    marginBottom: '40px',
  },
  titleContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    margin: '0 0 16px 0',
    padding: '0',
    width: '100%',
  },
  titleChar: {
    fontSize: '34px',
    fontWeight: 200,
    fontFamily: "'Inter', sans-serif",
    /* ロゴが目立つように白からオレンジへのグラデーションを強調 */
    background: 'linear-gradient(180deg, #ffffff 30%, #ff8c00 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textShadow: '0 4px 10px rgba(0,0,0,0.3)',
  },
  subtitle: {
    color: '#aaa',
    fontSize: '15px',
    letterSpacing: '1px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    width: '100%',
  },
  input: {
    width: '100%',
    padding: '16px 20px',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'rgba(0, 0, 0, 0.3)',
    color: '#fff',
    fontSize: '16px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 0.3s ease',
  },
  button: {
    marginTop: '10px',
    padding: '16px',
    borderRadius: '16px',
    border: 'none',
    background: 'linear-gradient(135deg, #ad5a71, #b9a088)',
    color: '#fff',
    fontWeight: '700',
    fontSize: '16px',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(255, 69, 0, 0.3)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  buttonInner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#ff8a8a',
    fontSize: '14px',
    background: 'rgba(255, 0, 0, 0.15)',
    padding: '12px',
    borderRadius: '12px',
    textAlign: 'left',
    border: '1px solid rgba(255, 0, 0, 0.2)',
  },
  switch: {
    marginTop: '32px',
    background: 'none',
    border: 'none',
    color: '#999',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'color 0.2s',
  },
  terms: {
    fontSize: '12px',
    color: '#777',
    marginTop: '16px',
    lineHeight: '1.6',
  },
  link: {
    color: '#db63bb',
    textDecoration: 'none',
    fontWeight: '600',
  },
}