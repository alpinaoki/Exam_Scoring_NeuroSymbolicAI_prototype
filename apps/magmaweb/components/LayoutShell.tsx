'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import type { ReactNode, CSSProperties } from 'react'
import { uploadImageToCloudinary } from '../lib/upload'
import ImageEditorModal from './ImageEditorModalForLS'
import ReactionEditorModal from './ReactionEditorModalForLS'
import {
  UserRound,
  Sparkles,
  Search,
  BarChart3,
  HelpCircle,
  Loader2,
  X,
  Camera
} from 'lucide-react'

type Props = {
  children: ReactNode
}

export default function LayoutShell({ children }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const cameraInputRef = useRef<HTMLInputElement>(null)

  /** =========================
   * 状態管理
   * ========================= */
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0)
  const [direction, setDirection] = useState<'in' | 'out'>('in') 
  const [rawFile, setRawFile] = useState<File | null>(null)
  const [problemFile, setProblemFile] = useState<File | null>(null)
  const [answerFile, setAnswerFile] = useState<File | null>(null)
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [uploading, setUploading] = useState(false)

  // ステップ遷移時のアニメーション制御
  const goToStep = (next: 0 | 1 | 2 | 3) => {
    setDirection('out')
    setTimeout(() => {
      setStep(next)
      setDirection('in')
    }, 250) 
  }

  const reset = () => {
    setStep(0)
    setRawFile(null)
    setProblemFile(null)
    setAnswerFile(null)
    setUploading(false)
  }

  // 特定のページではシェル（ヘッダー・フッター）を表示しない
  if (pathname === '/login' || pathname === '/terms' || pathname.startsWith('/threads')) {
    return <>{children}</>
  }

  /** =========================
   * 最終投稿処理
   * ========================= */
  const handleFinalSubmit = async (reactionData?: any) => {
    if (!problemFile) return
    setUploading(true)

    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData.user) throw new Error('認証に失敗しました')
      const userId = userData.user.id

      // 1. 問題のアップロード
      const pUrl = await uploadImageToCloudinary(problemFile)
      
      const { data: pInserted, error: pError } = await supabase
        .from('posts')
        .insert({
          user_id: userId,
          type: 'problem',
          image_url: pUrl,
          anonymous: isAnonymous, 
        })
        .select('id')
        .single()

      if (pError || !pInserted) throw pError
      const pId = pInserted.id

      // root_id を自分自身に更新
      await supabase.from('posts').update({ root_id: pId }).eq('id', pId)

      // 2. 解答がある場合
      if (answerFile) {
        const aUrl = await uploadImageToCloudinary(answerFile)
        
        const { data: aInserted, error: aError } = await supabase
          .from('posts')
          .insert({
            user_id: userId,
            type: 'answer',
            image_url: aUrl,
            parent_id: pId,
            root_id: pId,
            anonymous: isAnonymous,
          })
          .select('id')
          .single()

        if (aError || !aInserted) throw aError
        const aId = aInserted.id

        // 3. リアクション（質問ピン）がある場合
        if (reactionData) {
          const { error: rError } = await supabase.from('reactions').insert({
            post_id: aId,
            user_id: userId,
            type: reactionData.type,
            comment: reactionData.comment,
            x_float: reactionData.x, 
            y_float: reactionData.y,
          })
          if (rError) throw rError
        }
      }

      reset()
      router.refresh()
      router.push('/feed')
      
    } catch (error: any) {
      console.error('Submit Error:', error)
      alert('投稿に失敗しました。\n理由: ' + (error.message || 'Unknown Error'))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={styles.wrapper}>
      {/* 通常のヘッダー */}
      <header style={styles.header} onClick={() => router.push('/feed')}>
        <span style={styles.logo}>Magmathe</span>
      </header>

      <main style={styles.main}>{children}</main>

      {/* 通常のフッター */}
      <footer style={styles.footer}>
        <button style={styles.icon} onClick={() => router.push('/feed')}><Sparkles size={28} /></button>
        <button style={styles.icon} onClick={() => router.push('/search')}><Search size={28} /></button>
        <button style={styles.plus} onClick={() => goToStep(1)}><HelpCircle size={22} /></button>
        <button style={styles.icon} onClick={() => router.push('/analysis')}><BarChart3 size={28} /></button>
        <button style={styles.icon} onClick={() => router.push('/me')}><UserRound size={28} /></button>
      </footer>

      {/* ======================================================
          3ステップ・フル画面投稿フロー
      ======================================================= */}
      {step > 0 && (
        <div style={styles.fullOverlay}>
          {/* 上部プログレスバー */}
          <div style={styles.progressContainer}>
            {[1, 2, 3].map((s) => (
              <div key={s} style={styles.progressBarBase}>
                <div style={{
                  ...styles.progressBarFill,
                  width: step >= s ? '100%' : '0%'
                }} />
              </div>
            ))}
            <button onClick={reset} style={styles.closeCircle} aria-label="キャンセル">
              <X size={20} />
            </button>
          </div>

          <div className={direction === 'in' ? 'slide-in' : 'slide-out'} style={styles.stepContent}>
            
            {/* Step 1: 問題文の撮影・選択 */}
            {step === 1 && (
              <div style={styles.stepContainer}>
                {!rawFile ? (
                  <>
                    <h2 style={styles.stepTitle}>問題文を撮影</h2>
                    <p style={styles.stepDesc}>まずは解きたい問題を撮りましょう</p>
                    <button style={styles.mainActionBtn} onClick={() => cameraInputRef.current?.click()}>
                      <Camera size={24} /> カメラを起動
                    </button>
                  </>
                ) : (
                  <ImageEditorModal
                    file={rawFile}
                    anonymous={isAnonymous}
                    onAnonymousChange={setIsAnonymous}
                    onCancel={() => setRawFile(null)}
                    onConfirm={(editedFile) => {
                      setProblemFile(editedFile)
                      setRawFile(null)
                      goToStep(2)
                    }}
                    showAnonymous={true}
                  />
                )}
              </div>
            )}

            {/* Step 2: 解答・考え方の撮影・選択 */}
            {step === 2 && (
              <div style={styles.stepContainer}>
                {!rawFile ? (
                  <>
                    <h2 style={styles.stepTitle}>自分の考えを撮影</h2>
                    <p style={styles.stepDesc}>書いたところまででOK！ヒントになります</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 320 }}>
                      <button style={styles.mainActionBtn} onClick={() => cameraInputRef.current?.click()}>
                        <Camera size={24} /> カメラを起動
                      </button>
                      <button style={styles.skipBtn} onClick={() => handleFinalSubmit()}>
                        撮影せずに問題だけ投稿する
                      </button>
                    </div>
                  </>
                ) : (
                  <ImageEditorModal
                    file={rawFile}
                    anonymous={isAnonymous}
                    onAnonymousChange={setIsAnonymous}
                    onCancel={() => setRawFile(null)}
                    onConfirm={(editedFile) => {
                      setAnswerFile(editedFile)
                      setRawFile(null)
                      goToStep(3)
                    }}
                    showAnonymous={false}
                  />
                )}
              </div>
            )}

            {/* Step 3: 質問ピン打ち */}
            {step === 3 && answerFile && (
              <ReactionEditorModal
                open={true}
                imageUrl={URL.createObjectURL(answerFile)}
                postId="temp"
                username="me"
                onClose={(reactionData) => {
                  if (reactionData) {
                    handleFinalSubmit(reactionData)
                  } else {
                    reset() // キャンセルなら最初からやり直し
                  }
                }}
              />
            )}
          </div>

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) setRawFile(f)
            }}
          />
        </div>
      )}

      {/* 送信中オーバーレイ */}
      {uploading && (
        <div style={styles.loadingOverlay}>
          <Loader2 size={48} className="animate-spin-custom" />
          <p style={{ marginTop: 12, fontWeight: 'bold' }}>投稿を作成中...</p>
        </div>
      )}

      {/* アニメーション用CSS */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(-100%); opacity: 0; }
        }
        .slide-in { animation: slideIn 0.3s cubic-bezier(0.25, 1, 0.5, 1) forwards; }
        .slide-out { animation: slideOut 0.25s cubic-bezier(0.25, 1, 0.5, 1) forwards; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-spin-custom { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  )
}

/** =========================
 * スタイル定義
 * ========================= */
const styles: { [key: string]: CSSProperties } = {
  wrapper: {
    minHeight: '100vh',
    paddingTop: 32,
    paddingBottom: 54,
    background: '#fff',
  },
  header: {
    position: 'fixed', top: 0, left: 0, right: 0, height: 32,
    display: 'flex', alignItems: 'center', background: '#111', zIndex: 1000,
    cursor: 'pointer', paddingLeft: 16,
  },
  logo: { fontWeight: 'bold', fontSize: 18, color: '#fff' },
  main: { paddingBottom: 16 },
  footer: {
    position: 'fixed', bottom: 0, left: 0, right: 0, height: 54,
    display: 'flex', justifyContent: 'space-around', alignItems: 'center',
    background: '#111', zIndex: 1000,
  },
  icon: { background: 'none', border: 'none', color: '#eee', cursor: 'pointer' },
  plus: {
    width: 36, height: 36, borderRadius: '50%', border: '3px solid #444',
    color: '#eee', display: 'flex', justifyContent: 'center', alignItems: 'center',
    padding: 0, cursor: 'pointer'
  },
  // フル画面フロー用
  fullOverlay: {
    position: 'fixed', inset: 0, background: '#000', zIndex: 3000,
    display: 'flex', flexDirection: 'column', color: '#fff',
  },
  progressContainer: {
    padding: '20px 16px', display: 'flex', gap: 8, alignItems: 'center',
    marginTop: 'env(safe-area-inset-top, 20px)'
  },
  progressBarBase: { flex: 1, height: 4, background: '#333', borderRadius: 2, overflow: 'hidden' },
  progressBarFill: { height: '100%', background: '#00aaff', transition: 'width 0.4s ease' },
  closeCircle: { 
    width: 32, height: 32, borderRadius: '50%', background: '#222', 
    display: 'flex', alignItems: 'center', justifyContent: 'center', 
    border: 'none', color: '#fff', marginLeft: 8, cursor: 'pointer'
  },
  stepContent: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  stepContainer: {
    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', 
    justifyContent: 'center', padding: '0 32px', textAlign: 'center'
  },
  stepTitle: { fontSize: 26, fontWeight: 'bold', marginBottom: 12 },
  stepDesc: { fontSize: 16, color: '#aaa', marginBottom: 48, lineHeight: 1.5 },
  mainActionBtn: {
    width: '100%', background: '#00aaff', color: '#fff', border: 'none', 
    padding: '20px', borderRadius: '18px', fontSize: 18, fontWeight: 'bold',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, cursor: 'pointer'
  },
  skipBtn: {
    background: 'transparent', color: '#666', border: 'none', fontSize: 14, 
    textDecoration: 'underline', cursor: 'pointer', marginTop: 8
  },
  loadingOverlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 5000,
    display: 'flex', flexDirection: 'column', justifyContent: 'center', 
    alignItems: 'center', color: '#fff'
  },
}