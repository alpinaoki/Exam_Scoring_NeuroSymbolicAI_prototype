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

      {/* ===== スライド全体 ===== */}
      <div style={styles.slider}>

        {/* ① スタート（入力あり） */}
        <div style={styles.slide}>
          <img src="/illustration-main.png" style={styles.image}/>
          <h2>Magmathe</h2>
          <p>解き方でつながる</p>

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
        </div>

        {/* ② 機能 */}
        <div style={styles.slide}>
          <img src="/card1.png" style={styles.cardImg}/>
          <p>他の人の解き方が見れる</p>
        </div>

        {/* ③ 機能 */}
        <div style={styles.slide}>
          <img src="/card2.png" style={styles.cardImg}/>
          <p>間違いも価値になる</p>
        </div>

        {/* ④ 機能 */}
        <div style={styles.slide}>
          <img src="/card3.png" style={styles.cardImg}/>
          <p>どこが大事か分かる</p>
        </div>

        {/* ⑤ 最後（入力＋ボタン） */}
        <div style={styles.slide}>
          <h2>{mode === 'login' ? 'ログイン' : '新規登録'}</h2>

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
              <AlertCircle size={16}/>
              <span>{error}</span>
            </div>
          )}

          <button onClick={handleSubmit} style={styles.button}>
            {loading ? '処理中...' : (
              <div style={styles.buttonInner}>
                {mode === 'login' ? <LogIn size={18}/> : <UserPlus size={18}/>}
                <span>{mode === 'login' ? 'ログイン' : '登録'}</span>
              </div>
            )}
          </button>

          <button
            style={styles.switch}
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          >
            切り替え
          </button>
        </div>

      </div>

      <p style={styles.swipe}>← スワイプ →</p>
    </div>
  )
}

const styles: { [key: string]: CSSProperties } = {

  page: {
    height: '100vh',
    background: '#eef3f6',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },

  slider: {
    display: 'flex',
    overflowX: 'auto',
    scrollSnapType: 'x mandatory',
  },

  slide: {
    minWidth: '100%',
    padding: '30px',
    boxSizing: 'border-box',
    textAlign: 'center',
    scrollSnapAlign: 'start',
  },

  image: {
    width: '70%',
    maxWidth: '260px',
    marginBottom: '10px',
  },

  cardImg: {
    width: '80%',
    borderRadius: '12px',
    marginBottom: '10px',
  },

  input: {
    width: '100%',
    padding: '12px',
    marginTop: '10px',
    borderRadius: '8px',
    border: '1px solid #ccc',
  },

  button: {
    marginTop: '12px',
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
    marginTop: '8px',
  },

  switch: {
    marginTop: '10px',
    background: 'none',
    border: 'none',
  },

  swipe: {
    textAlign: 'center',
    fontSize: '12px',
    color: '#666',
    marginTop: '10px',
  },
}