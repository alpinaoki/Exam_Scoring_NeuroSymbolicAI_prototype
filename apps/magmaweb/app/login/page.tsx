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
      {/* タイトルに使用する Inter 200 を読み込み */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@200&display=swap');
      `}</style>

      {/* 装飾用の背景のボケ */}
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
    // 真っ黒ではなく、深いワインレッド/ブラウンを混ぜたダークグラデーション
    background: 'radial-gradient(circle at 50% 50%, #1a0f0f 0%, #050505 100%)',
    color: '#eee',
    position: 'relative',
    overflow: 'hidden',
  },
  // 背景のボケ（マグマの鼓動のような光）
  blob: {
    position: 'absolute',
    width: '600px',
    height: '600px',
    // より熱を感じる色に変更し、少し位置をずらして深みを出す
    background: 'radial-gradient(circle, rgba(255, 50, 0, 0.08) 0%, transparent 70%)',
    filter: 'blur(80px)',
    top: '40%',
    left: '30%',
    zIndex: 0,
    animation: 'pulse 8s ease-in-out infinite alternate', // 動きを想定
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    padding: '48px 40px',
    borderRadius: '28px',
    // 背景を真っ黒から「少し明るいグレーの半透明」にすることで、背景との境界を作る
    background: 'rgba(30, 30, 30, 0.4)',
    backdropFilter: 'blur(20px)', // ガラスの曇り具合を強化
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.08)', // 繊細なエッジ
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    zIndex: 1,
    textAlign: 'center',
  },
  header: {
    marginBottom: '40px',
  },
  /* タイトル: フォントの良さを活かしつつ少しサイズ調整 */
  title: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '38px',
    fontWeight: 200,
    letterSpacing: '10px', 
    textTransform: 'uppercase',
    margin: '0 0 8px 0',
    paddingLeft: '10px', 
    background: 'linear-gradient(180deg, #fff 0%, #ff4d00 100%)', // 上から白が入るグラデーションで高級感
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