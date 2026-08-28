'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { CSSProperties } from 'react'
import Link from 'next/link'
import { signIn, signUp } from '../../lib/auth'
import { LogIn, UserPlus, AlertCircle, ChevronDown } from 'lucide-react'

const BACKGROUND_IMAGE_URL = 'url("https://res.cloudinary.com/dk8pvfpzx/image/upload/v1779023101/img_9848_720_eoufy3.jpg")'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

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
      
      const nextPath = searchParams.get('next')
      if (nextPath) {
        router.push(nextPath)
      } else {
        router.push('/feed')
      }
    } catch (e: any) {
      setError(e.message ?? 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }
 
  const AgreementText = ({ whiteMode = false }: { whiteMode?: boolean }) => (
    <p style={whiteMode ? styles.agreementWhite : styles.agreement}>
      続行することで、
      <Link href="/terms" style={whiteMode ? styles.agreementLinkWhite : styles.agreementLink}>Magmatheの利用規約</Link>
      に同意し、Magmatheのプライバシーポリシーを読んだものとみなされます。
    </p>
  )

  return (
    <div style={styles.page}>
      <div style={styles.slider}>

        {/* ① スタート（5枚目とUIを完全に統合） */}
        <div style={{ ...styles.slide, ...styles.imageSlide, position: 'relative' }}>
          <div style={styles.fullContentContainer}>
            <h1 style={styles.logoTextWhite}>Magmathe(旧)へようこそ！</h1>
            <p style={styles.catchphraseWhite}>解き方でつながる高校生のための数学SNS</p>

            <h2 style={styles.formTitleWhite}>{mode === 'login' ? 'ログイン' : '新規登録'}</h2>

            <input
              placeholder="ユーザー名"
              value={username}
              onChange={e => setUsername(e.target.value)}
              style={{ ...styles.input, ...styles.inputWhite }}
            />
            <input
              type="password"
              placeholder="パスワード"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ ...styles.input, ...styles.inputWhite }}
            />

            {error && (
              <div style={styles.errorBoxWhite}>
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
              style={styles.switchWhite}
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            >
              {mode === 'login' ? 'アカウントをお持ちでないですか？ 新規登録' : '既にアカウントをお持ちですか？ ログイン'}
            </button>

            <AgreementText whiteMode />
          </div>

          {/* 下へのスクロールを促すナビゲーション */}
          <div style={styles.scrollIndicator}>
            <span style={styles.scrollText}>特徴を見る</span>
            <ChevronDown size={24} style={styles.scrollIconAnimated} />
          </div>
        </div>

        {/* ② 機能 */}
        <div style={{ 
          ...styles.slide, 
          backgroundImage: 'linear-gradient(rgba(30, 45, 59, 0.75), rgba(30, 45, 59, 0.85)), url("https://res.cloudinary.com/dk8pvfpzx/image/upload/v1781970858/IMG_0198_wrsijb.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
          <div style={styles.fullContentContainer}>
            <p style={styles.descTextWhite}>１つの問題、たくさんの考え方</p>
          </div>
        </div>

        {/* ③ 機能 */}
        <div style={{ 
          ...styles.slide, 
          backgroundImage: 'linear-gradient(rgba(36, 52, 47, 0.75), rgba(36, 52, 47, 0.85)), url("https://res.cloudinary.com/dk8pvfpzx/image/upload/v1781970858/IMG_0196_p6z6di.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
          <div style={styles.fullContentContainer}>
            <p style={styles.descTextWhite}>解きたい分野がすぐに見つかる</p>
          </div>
        </div>

        {/* ④ 機能 */}
        <div style={{ 
          ...styles.slide, 
          backgroundImage: 'linear-gradient(rgba(43, 36, 54, 0.75), rgba(43, 36, 54, 0.85)), url("https://res.cloudinary.com/dk8pvfpzx/image/upload/v1781970858/IMG_0197_lbuuys.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
          <div style={styles.fullContentContainer}>
            <p style={styles.descTextWhite}>リアクションから新たな発見を</p>
          </div>
        </div>

        {/* ⑤ 最後 */}
        <div style={{ ...styles.slide, ...styles.imageSlide }}>
          <div style={styles.fullContentContainer}>
            <h2 style={styles.formTitleWhite}>{mode === 'login' ? 'ログイン' : '新規登録'}</h2>

            <input
              placeholder="ユーザー名"
              value={username}
              onChange={e => setUsername(e.target.value)}
              style={{ ...styles.input, ...styles.inputWhite }}
            />
            <input
              type="password"
              placeholder="パスワード"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ ...styles.input, ...styles.inputWhite }}
            />

            {error && (
              <div style={styles.errorBoxWhite}>
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
              style={styles.switchWhite}
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            >
              {mode === 'login' ? 'アカウントをお持ちでないですか？ 新規登録' : '既にアカウントをお持ちですか？ ログイン'}
            </button>

            <AgreementText whiteMode />
          </div>
        </div>

      </div>

      {/* スクリプト注入による簡易的な矢印上下アニメーションの適用 */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }
      `}} />
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ color: '#fff', padding: 20 }}>Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}

const styles: { [key: string]: CSSProperties } = {
  page: {
    height: '100dvh',
    background: '#2c3e50', 
    overflow: 'hidden',
  },

  slider: {
    height: '100%',
    overflowY: 'auto',
    scrollSnapType: 'y mandatory', 
    scrollbarWidth: 'none',        
    msOverflowStyle: 'none',       
    WebkitOverflowScrolling: 'touch',
  },

  slide: {
    height: '100dvh',
    minHeight: '100dvh',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    boxSizing: 'border-box',
    scrollSnapAlign: 'start',      
    scrollSnapStop: 'always', 
    transition: 'background 0.4s ease', 
  },

  imageSlide: {
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.75)), ${BACKGROUND_IMAGE_URL}`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },

  fullContentContainer: {
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoTextWhite: {
    fontSize: '32px',
    fontWeight: '900',
    color: '#fff',
    margin: '12px 0 4px',
    letterSpacing: '-0.03em',
  },

  catchphraseWhite: {
    fontSize: '15px',
    fontWeight: 'bold',
    color: '#e2e8f0',
    marginBottom: '16px',
  },

  descTextWhite: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#fff',
    marginTop: '16px',
    marginLeft: 0,
    marginRight: 0,
    textShadow: '0 2px 8px rgba(0,0,0,0.3)',
  },

  formTitleWhite: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#fff',
    marginBottom: '8px',
    opacity: 0.9,
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

  inputWhite: {
    border: '1px solid rgba(255, 255, 255, 0.3)',
    background: 'rgba(255, 255, 255, 0.15)',
    color: '#fff',
    backdropFilter: 'blur(8px)',
  },

  button: {
    marginTop: '20px',
    width: '100%',
    padding: '14px',
    background: '#4D96FF', 
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

  errorBoxWhite: {
    color: '#ff6b6b',
    fontSize: '13px',
    marginTop: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontWeight: 'bold',
  },

  switchWhite: {
    marginTop: '16px',
    background: 'none',
    border: 'none',
    color: '#cbd5e1',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'underline',
    marginBottom: '8px',
  },

  agreement: {
    fontSize: '11px',
    color: '#95a5a6',
    lineHeight: '1.5',
    marginTop: '20px',
    textAlign: 'center',
    wordBreak: 'break-all',
  },

  agreementWhite: {
    fontSize: '11px',
    color: '#94a3b8',
    lineHeight: '1.5',
    marginTop: '20px',
    textAlign: 'center',
    wordBreak: 'break-all',
  },

  agreementLink: {
    color: '#7f8c8d',
    textDecoration: 'underline',
    fontWeight: 'bold',
    margin: '0 2px',
  },

  agreementLinkWhite: {
    color: '#f1f5f9',
    textDecoration: 'underline',
    fontWeight: 'bold',
    margin: '0 2px',
  },

  scrollIndicator: {
    position: 'absolute',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    color: 'rgba(255, 255, 255, 0.6)',
    cursor: 'default',
    pointerEvents: 'none',
  },

  scrollText: {
    fontSize: '11px',
    fontWeight: '600',
    letterSpacing: '0.05em',
  },

  scrollIconAnimated: {
    animation: 'bounce 2s infinite ease-in-out',
  },
}