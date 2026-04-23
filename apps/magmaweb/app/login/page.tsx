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

  // ⭐ 機能＋使い方
  const slides = [
    { title: '解き方を共有', desc: 'いろんな考え方を見て学べる', pos: 'center' },
    { title: '誤答にも価値', desc: '間違いから理解が深まる', pos: 'top' },
    { title: '①問題を探す', desc: 'タグで見つける', pos: 'left' },
    { title: '②解いて投稿', desc: '写真で簡単投稿', pos: 'right' },
    { title: '③他の解答を見る', desc: '投稿後に閲覧可能', pos: 'bottom' },
    { title: '④リアクション', desc: '⭐︎・！・？で反応', pos: 'center' },
  ]

  const [current, setCurrent] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return
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

      {/* ⭐ チュートリアル */}
      <div
        style={styles.tutorial}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={() => setCurrent((current + 1) % slides.length)}
      >
        {/* 画像（ズーム位置変える） */}
        <img
          src="/tutorial.png"
          style={{
            ...styles.image,
            objectPosition: slides[current].pos === 'top' ? 'center top'
              : slides[current].pos === 'bottom' ? 'center bottom'
              : slides[current].pos === 'left' ? 'left center'
              : slides[current].pos === 'right' ? 'right center'
              : 'center'
          }}
        />

        {/* テキスト */}
        <div style={styles.overlay}>
          <h2>{slides[current].title}</h2>
          <p>{slides[current].desc}</p>
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

        <p style={styles.hint}>スワイプ or タップ</p>
      </div>

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

  tutorial: {
    flex: 1,
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },

  image: {
    width: '90%',
    maxWidth: '420px',
    height: 'auto',
    objectFit: 'cover',
  },

  overlay: {
    position: 'absolute',
    bottom: '20px',
    background: 'rgba(255,255,255,0.95)',
    padding: '14px',
    borderRadius: '12px',
    textAlign: 'center',
  },

  dots: {
    position: 'absolute',
    bottom: '80px',
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
    position: 'absolute',
    bottom: '0px',
    fontSize: '12px',
    color: '#666',
  },

  login: {
    padding: '20px',
    background: '#fff',
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