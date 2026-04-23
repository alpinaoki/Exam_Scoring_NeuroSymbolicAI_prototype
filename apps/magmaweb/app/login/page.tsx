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

  // ⭐ チュートリアル内容（機能＋使い方）
  const slides = [
    { title: '解き方を共有', desc: 'いろんな考え方を見て学べる' },
    { title: '誤答にも価値', desc: '間違いから理解が深まる' },
    { title: '①問題を探す', desc: 'タグで簡単に見つける' },
    { title: '②解いて投稿', desc: '写真を撮ってそのまま投稿' },
    { title: '③他の解答を見る', desc: '投稿後に閲覧できる' },
    { title: '④リアクション', desc: '⭐︎・！・？でフィードバック' },
  ]

  const [current, setCurrent] = useState(0)
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
      
      {/* ⭐ 左：チュートリアル */}
      <div
        style={styles.left}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={() => setCurrent((current + 1) % slides.length)}
      >
        {/* 送ってくれたイラスト */}
        <img src="/tutorial.png" style={styles.image} />

        {/* テキスト重ね */}
        <div style={styles.overlayBox}>
          <h2 style={styles.slideTitle}>{slides[current].title}</h2>
          <p style={styles.slideDesc}>{slides[current].desc}</p>
        </div>

        {/* ドット */}
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

        <p style={styles.hint}>← スワイプ / タップ →</p>
      </div>

      {/* ⭐ 右：ログイン */}
      <div style={styles.right}>
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

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={styles.button}
        >
          {loading ? '処理中...' : (
            <div style={styles.buttonInner}>
              {mode === 'login' ? <LogIn size={18} /> : <UserPlus size={18} />}
              <span>{mode === 'login' ? 'ログイン' : '登録'}</span>
            </div>
          )}
        </button>

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
    display: 'flex',
    height: '100vh',
    fontFamily: 'sans-serif',
  },

  left: {
    flex: 1,
    background: '#e6edf2',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px',
    position: 'relative',
  },

  right: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '40px',
  },

  image: {
    width: '90%',
    maxWidth: '420px',
  },

  overlayBox: {
    position: 'absolute',
    bottom: '80px',
    background: 'rgba(255,255,255,0.95)',
    padding: '16px 20px',
    borderRadius: '14px',
    textAlign: 'center',
    boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
  },

  slideTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
  },

  slideDesc: {
    fontSize: '14px',
    marginTop: '4px',
  },

  dots: {
    marginTop: '16px',
    display: 'flex',
    gap: '6px',
  },

  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#333',
  },

  hint: {
    fontSize: '12px',
    marginTop: '10px',
    color: '#555',
  },

  title: {
    fontSize: '28px',
    marginBottom: '20px',
  },

  input: {
    padding: '12px',
    marginBottom: '10px',
    borderRadius: '8px',
    border: '1px solid #ccc',
  },

  button: {
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