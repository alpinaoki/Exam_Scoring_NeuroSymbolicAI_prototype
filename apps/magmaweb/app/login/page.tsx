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

  // 🌿 やわらかチュートリアル
  const slides = [
    { title: '問題を探す', desc: 'タグで簡単に見つけられる' },
    { title: '解いて投稿', desc: '写真を撮るだけでOK' },
    { title: '他の人を見る', desc: 'いろんな解き方がわかる' },
    { title: '評価しよう', desc: '⭐︎・！・？で反応できる' },
  ]

  const [current, setCurrent] = useState(0)

  // スワイプ
  const [touchStart, setTouchStart] = useState<number | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return
    const diff = touchStart - e.changedTouches[0].clientX

    if (diff > 50 && current < slides.length - 1) {
      setCurrent(current + 1)
    } else if (diff < -50 && current > 0) {
      setCurrent(current - 1)
    }

    setTouchStart(null)
  }

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
      <div style={styles.card}>

        {/* 🌿 チュートリアルスライド */}
        <div
          style={styles.slide}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={() => setCurrent((current + 1) % slides.length)}
        >
          <div style={styles.paper}>
            <h2 style={styles.slideTitle}>{slides[current].title}</h2>
            <p style={styles.slideDesc}>{slides[current].desc}</p>
          </div>

          <div style={styles.dots}>
            {slides.map((_, i) => (
              <span
                key={i}
                style={{
                  ...styles.dot,
                  opacity: i === current ? 1 : 0.3
                }}
              />
            ))}
          </div>

          <div style={styles.hint}>← スワイプ / タップ →</div>
        </div>

        <h1 style={styles.title}>Magmathe</h1>

        <div style={styles.form}>
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

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={styles.button}
          >
            {loading ? '処理中...' : (
              <div style={styles.buttonInner}>
                {mode === 'login' ? <LogIn size={18} /> : <UserPlus size={18} />}
                <span>{mode === 'login' ? 'ログイン' : 'アカウント作成'}</span>
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
    justifyContent: 'center',
    alignItems: 'center',
    background: '#f4f4f4',
  },

  card: {
    width: '95%',
    maxWidth: '420px',
    padding: '20px',
    borderRadius: '20px',
    background: '#ffffff',
    textAlign: 'center',
  },

  slide: {
    marginBottom: '20px',
  },

  paper: {
    background: '#fafafa',
    padding: '20px',
    borderRadius: '16px',
    border: '1px solid #ddd',
    textAlign: 'left',
  },

  slideTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
  },

  slideDesc: {
    fontSize: '14px',
    marginTop: '6px',
  },

  hint: {
    fontSize: '12px',
    color: '#999',
    marginTop: '8px',
  },

  dots: {
    display: 'flex',
    justifyContent: 'center',
    gap: '6px',
    marginTop: '10px',
  },

  dot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#555',
  },

  title: {
    fontSize: '26px',
    marginBottom: '10px',
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },

  input: {
    padding: '12px',
    borderRadius: '10px',
    border: '1px solid #ccc',
  },

  button: {
    padding: '12px',
    borderRadius: '10px',
    background: '#6c8ea4',
    color: '#fff',
    border: 'none',
  },

  buttonInner: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    alignItems: 'center',
  },

  errorBox: {
    color: 'red',
    fontSize: '12px',
  },

  switch: {
    marginTop: '10px',
    background: 'none',
    border: 'none',
    color: '#666',
  },
}