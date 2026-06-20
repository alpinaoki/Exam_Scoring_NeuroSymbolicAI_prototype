'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { CSSProperties } from 'react'
import Link from 'next/link'
import { signIn, signUp } from '../../lib/auth'
import { LogIn, UserPlus, AlertCircle } from 'lucide-react'

// ★ 背景画像のURL
const BACKGROUND_IMAGE_URL = 'url("https://res.cloudinary.com/dk8pvfpzx/image/upload/v1779023101/img_9848_720_eoufy3.jpg")'

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

  // 同意文言の共通コンポーネント化（白背景用と暗い背景用のスタイルを切り替え）
  const AgreementText = ({ whiteMode = false }: { whiteMode?: boolean }) => (
    <p style={whiteMode ? styles.agreementWhite : styles.agreement}>
      続行することで、
      <Link href="/terms" style={whiteMode ? styles.agreementLinkWhite : styles.agreementLink}>Magmatheの利用規約</Link>
      に同意し、Magmatheのプライバシーポリシーを読んだものとみなされます。
    </p>
  )

  return (
    <div style={styles.page}>

      {/* ===== 縦方向のスライダコンテナ ===== */}
      <div style={styles.slider}>

        {/* ① スタート（カードなし・背景画像に白文字を載せる形式） */}
        <div style={{ ...styles.slide, ...styles.imageSlide }}>
          <div style={styles.fullContentContainer}>
            <h1 style={styles.logoTextWhite}>Magmatheへようこそ！</h1>
            <p style={styles.catchphraseWhite}>解き方でつながる高校生のための数学SNS</p>

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

            {/* ★ 1枚目にログインボタンを配置 */}
            <button onClick={handleSubmit} style={styles.button}>
              {loading ? '処理中...' : (
                <div style={styles.buttonInner}>
                  <LogIn size={18}/>
                  <span>ログイン</span>
                </div>
              )}
            </button>

            <AgreementText whiteMode />
          </div>
        </div>

        {/* ② 機能（背景：深みのあるブルーグリーン） */}
        <div style={{ ...styles.slide, backgroundColor: '#1e2d3b' }}>
          <div style={styles.contentCard}>
            <img src='url("https://res.cloudinary.com/dk8pvfpzx/image/upload/v1781970858/IMG_0198_wrsijb.jpg") style={styles.cardImg}/>
            <p style={styles.descText}>１つの問題、たくさんの考え方</p>
          </div>
        </div>

        {/* ③ 機能（背景：知的なモスグリーン） */}
        <div style={{ ...styles.slide, backgroundColor: '#24342f' }}>
          <div style={styles.contentCard}>
            <img src='url("https://res.cloudinary.com/dk8pvfpzx/image/upload/v1781970858/IMG_0196_p6z6di.jpg")' style={styles.cardImg}/>
            <p style={styles.descText}>解きたい分野がすぐに見つかる</p>
          </div>
        </div>

        {/* ④ 機能（背景：気品のあるディープパープル） */}
        <div style={{ ...styles.slide, backgroundColor: '#2b2436' }}>
          <div style={styles.contentCard}>
            <img src='url("https://res.cloudinary.com/dk8pvfpzx/image/upload/v1781970858/IMG_0197_lbuuys.jpg")' style={styles.cardImg}/>
            <p style={styles.descText}>リアクションから新たな発見を</p>
          </div>
        </div>

        {/* ⑤ 最後（フォーム完了・カードなし・背景画像に白文字を載せる形式） */}
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
              style={{ ...styles.switch, ...styles.switchWhite }}
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            >
              {mode === 'login' ? 'アカウントをお持ちでないですか？ 新規登録' : '既にアカウントをお持ちですか？ ログイン'}
            </button>

            <AgreementText whiteMode />
          </div>
        </div>

      </div>
    </div>
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
    transition: 'background-color 0.4s ease', // スワイプ時の色変化を滑らかにする
  },

  // ★ 追加：1枚目と5枚目の背景画像用（少し暗く落とすためにグラデーションを重ねる）
  imageSlide: {
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.75)), ${BACKGROUND_IMAGE_URL}`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },

  // ★ 追加：白カードの代わりに全体を受け止める透明なコンテナ
  fullContentContainer: {
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },

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

  // ★ 追加：背景画像上の白いロゴテキスト
  logoTextWhite: {
    fontSize: '32px',
    fontWeight: '900',
    color: '#fff',
    margin: '12px 0 4px',
    letterSpacing: '-0.03em',
  },

  catchphrase: {
    fontSize: '15px',
    fontWeight: 'bold',
    color: '#7f8c8d',
    marginBottom: '24px',
  },

  // ★ 追加：背景画像上の白いキャッチフレーズ
  catchphraseWhite: {
    fontSize: '15px',
    fontWeight: 'bold',
    color: '#e2e8f0',
    marginBottom: '24px',
  },

  descText: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#2c3e50',
    marginTop: '16px',
    marginLeft: 0,
    marginRight: 0,
  },

  formTitle: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#2c3e50',
    marginBottom: '16px',
  },

  // ★ 追加：背景画像上の白いフォームタイトル
  formTitleWhite: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#fff',
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

  // ★ 追加：透過した白いインプットボックス
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

  errorBox: {
    color: '#e74c3c',
    fontSize: '13px',
    marginTop: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontWeight: 'bold',
  },

  // ★ 追加：白背景用のエラーボックス
  errorBoxWhite: {
    color: '#ff6b6b',
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
    marginBottom: '8px', 
  },

  // ★ 追加：白い切替テキスト
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

  // ★ 追加：背景画像上の白い同意テキスト
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

  // ★ 追加：背景画像上の白い同意リンク
  agreementLinkWhite: {
    color: '#f1f5f9',
    textDecoration: 'underline',
    fontWeight: 'bold',
    margin: '0 2px',
  },
}