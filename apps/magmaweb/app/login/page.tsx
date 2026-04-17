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

  // ⭐ 数学系スライド
  const slides = [
    {
      title: '他の人の解き方が見れる',
      desc: 'いろんな考え方を知ることができる',
      img: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb'
    },
    {
      title: '間違いも価値になる',
      desc: '誤答から弱点やクセが分かる',
      img: 'https://images.unsplash.com/photo-1509228468518-180dd4864904'
    },
    {
      title: 'どこが大事か分かる',
      desc: '⭐︎・！・？でポイントが見える',
      img: 'https://images.unsplash.com/photo-1516542076529-1ea3854896f2'
    },
    {
      title: '自分の成長が見える',
      desc: '過去の解答を振り返れる',
      img: 'https://images.unsplash.com/photo-1526378722484-bd91ca387e72'
    },
  ]

  const [current, setCurrent] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return
    const touchEnd = e.changedTouches[0].clientX
    const diff = touchStart - touchEnd

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

        {/* スライド */}
        <div
          style={{
            ...styles.slider,
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.8)),
              url(${slides[current].img})
            `
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div style={styles.slideContent}>
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
                onClick={() => setCurrent(i)}
              />
            ))}
          </div>
        </div>

        <header style={styles.header}>
          <h1 style={styles.title}>MAGMATHE</h1>
          <p style={styles.subtitle}>
            {mode === 'login' ? '考え方を共有しよう' : 'サインアップ'}
          </p>
        </header>

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
            style={loading ? { ...styles.button, opacity: 0.7 } : styles.button}
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
              登録することで、
              <a href="/terms" style={styles.link}>利用規約</a>
              に同意したことになります。
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
    background: '#0f0505',
  },
  card: {
    width: '90%',
    maxWidth: '420px',
    padding: '30px',
    borderRadius: '20px',
    background: '#1a1a1a',
    color: '#fff',
    textAlign: 'center',
  },
  slider: {
    height: '180px',
    borderRadius: '16px',
    marginBottom: '20px',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '16px',
  },
  slideContent: {
    textAlign: 'left',
  },
  slideTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
  },
  slideDesc: {
    fontSize: '14px',
    color: '#ddd',
  },
  dots: {
    display: 'flex',
    justifyContent: 'center',
    gap: '6px',
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#fff',
    cursor: 'pointer',
  },
  header: {
    marginBottom: '20px',
  },
  title: {
    fontSize: '28px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#aaa',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  input: {
    padding: '12px',
    borderRadius: '10px',
    border: 'none',
  },
  button: {
    padding: '12px',
    borderRadius: '10px',
    background: '#ff6b6b',
    color: '#fff',
    border: 'none',
  },
  buttonInner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  },
  errorBox: {
    color: 'red',
    fontSize: '12px',
  },
  switch: {
    marginTop: '10px',
    background: 'none',
    border: 'none',
    color: '#aaa',
  },
  terms: {
    fontSize: '12px',
    color: '#777',
    marginTop: '16px',
  },
  link: {
    color: '#db63bb',
  },
}