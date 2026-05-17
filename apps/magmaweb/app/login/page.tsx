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

      {/* ===== 縦方向のスライダコンテナ ===== */}
      <div style={styles.slider}>

        {/* ① スタート */}
        <div style={styles.slide}>
          <div style={styles.contentCard}>
            <img src="/illustration-main.png" style={styles.image}/>
            <h1 style={styles.logoText}>Magmathe</h1>
            <p style={styles.catchphrase}>解き方でつながる</p>

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
        </div>

        {/* ② 機能 */}
        <div style={styles.slide}>
          <div style={styles.contentCard}>
            <img src="/card1.png" style={styles.cardImg}/>
            <p style={styles.descText}>他の人の解き方が見れる</p>
          </div>
        </div>

        {/* ③ 機能 */}
        <div style={styles.slide}>
          <div style={styles.contentCard}>
            <img src="/card2.png" style={styles.cardImg}/>
            <p style={styles.descText}>間違いも価値になる</p>
          </div>
        </div>

        {/* ④ 機能 */}
        <div style={styles.slide}>
          <div style={styles.contentCard}>
            <img src="/card3.png" style={styles.cardImg}/>
            <p style={styles.descText}>どこが大事か分かる</p>
          </div>
        </div>

        {/* ⑤ 最後（フォーム完了） */}
        <div style={styles.slide}>
          <div style={styles.contentCard}>
            <h2 style={styles.formTitle}>{mode === 'login' ? 'ログイン' : '新規登録'}</h2>

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
              {mode === 'login' ? 'アカウントをお持ちでないですか？ 新規登録' : '既にアカウントをお持ちですか？ ログイン'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

const styles: { [key: string]: CSSProperties } = {
  page: {
    height: '100dvh',
    background: '#2c3e50', // Magmatheのベースカラーを背景にしてPinterestの高級感を演出
    overflow: 'hidden',
  },

  // 縦方向にスナップさせるコンテナ
  slider: {
    height: '100%',
    overflowY: 'auto',
    scrollSnapType: 'y mandatory', // 縦方向の強力なスナップ
    scrollbarWidth: 'none',        // Firefox用：スクロールバー非表示
    msOverflowStyle: 'none',       // IE/Edge用：スクロールバー非表示
    WebkitOverflowScrolling: 'touch',
  },

  // 1つのスライドを画面全体(100dvh)にフィットさせる
  slide: {
    height: '100dvh',
    minHeight: '100dvh',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    boxSizing: 'border-box',
    scrollSnapAlign: 'start',      // 境界線でピタッと止まる
  },

  // 中央に浮かび上がる白いカード（Pinterest風）
  contentCard: {
    background: '#fff',
    padding: '40px 30px',
    borderRadius: '32px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoText: {
    fontSize: '32px',
    fontWeight: '900',
    color: '#2c3e50',
    margin: '12px 0 4px',
    letterSpacing: '-0.03em',
  },

  catchphrase: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#7f8c8d',
    marginBottom: '24px',
  },

  descText: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#2c3e50',
    marginTop: '16px',
    marginHorizontal: 0,
  },

  formTitle: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#2c3e50',
    marginBottom: '16px',
  },

  image: {
    width: '60%',
    maxWidth: '180px',
    height: 'auto',
  },

  cardImg: {
    width: '100%',
    borderRadius: '20px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
  },

  input: {
    width: '100%',
    padding: '14px 18px',
    marginTop: '12px',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    background: '#f8fafc',
    fontSize: '16px',
    outline: 'none',
    boxSizing: 'border-box',
  },

  button: {
    marginTop: '20px',
    width: '100%',
    padding: '14px',
    background: '#4D96FF', // 既存のボタンカラーと統一
    color: '#fff',
    border: 'none',
    borderRadius: '16px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(77, 150, 255, 0.3)',
  },

  buttonInner: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
  },

  errorBox: {
    color: '#e74c3c',
    fontSize: '13px',
    marginTop: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontWeight: 'bold',
  },

  switch: {
    marginTop: '16px',
    background: 'none',
    border: 'none',
    color: '#7f8c8d',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
}