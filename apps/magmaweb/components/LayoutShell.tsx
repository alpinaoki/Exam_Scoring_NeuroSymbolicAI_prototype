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
  const [rawFile, setRawFile] = useState<File | null>(null)
  const [problemFile, setProblemFile] = useState<File | null>(null)
  const [answerFile, setAnswerFile] = useState<File | null>(null)
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [uploading, setUploading] = useState(false)

  if (
    pathname === '/login' ||
    pathname === '/terms' ||
    pathname.startsWith('/threads')
  ) {
    return <>{children}</>
  }

  /** =========================
   * Step制御 & リセット
   * ========================= */

  const openFlow = () => setStep(1)

  const reset = () => {
    setStep(0)
    setRawFile(null)
    setProblemFile(null)
    setAnswerFile(null)
    setUploading(false)
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
      <header style={styles.header} onClick={() => router.push('/feed')}>
        <span style={styles.logo}>Magmathe</span>
      </header>

      <main style={styles.main}>{children}</main>

      <footer style={styles.footer}>
        <button style={styles.icon} onClick={() => router.push('/feed')}><Sparkles size={28} /></button>
        <button style={styles.icon} onClick={() => router.push('/search')}><Search size={28} /></button>
        <button style={styles.plus} onClick={openFlow}><HelpCircle size={22} /></button>
        <button style={styles.icon} onClick={() => router.push('/analysis')}><BarChart3 size={28} /></button>
        <button style={styles.icon} onClick={() => router.push('/me')}><UserRound size={28} /></button>
      </footer>

      {/* Step① 問題文撮影 */}
      {step === 1 && (
        <>
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
          {!rawFile && (
            <div style={styles.overlay} onClick={reset}>
              <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                <h3 style={{ marginBottom: 16 }}>① 問題文を撮影</h3>
                <button style={styles.selectBtn} onClick={() => cameraInputRef.current?.click()}>
                  画像を選択
                </button>
              </div>
            </div>
          )}
          {rawFile && (
            <ImageEditorModal
              file={rawFile}
              anonymous={isAnonymous}
              onAnonymousChange={setIsAnonymous}
              onCancel={reset}
              onConfirm={(editedFile) => {
                setProblemFile(editedFile)
                setRawFile(null)
                setStep(2)
              }}
              showAnonymous={true}
            />
          )}
        </>
      )}

      {/* Step② 考え方（解答）撮影 */}
      {step === 2 && (
        <>
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
          {!rawFile && (
            <div style={styles.overlay} onClick={reset}>
              <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                <h3 style={{ marginBottom: 16 }}>② 考え方を撮影</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <button style={styles.selectBtn} onClick={() => cameraInputRef.current?.click()}>
                    画像を選択
                  </button>
                  <button
                    style={{ ...styles.selectBtn, background: '#333' }}
                    onClick={() => handleFinalSubmit()} // ここでのスキップは問題のみを投稿
                  >
                    スキップして投稿
                  </button>
                </div>
              </div>
            </div>
          )}
          {rawFile && (
            <ImageEditorModal
              file={rawFile}
              anonymous={isAnonymous}
              onAnonymousChange={setIsAnonymous}
              onCancel={reset} // ここで「×」ならリセット
              onConfirm={(editedFile) => {
                setAnswerFile(editedFile)
                setStep(3)
              }}
              showAnonymous={false}
            />
          )}
        </>
      )}

      {/* Step③ 質問ピン */}
      {step === 3 && answerFile && (
        <ReactionEditorModal
          open={true}
          imageUrl={URL.createObjectURL(answerFile)}
          postId="temp"
          username={'me'}
          onClose={(reactionData) => {
            if (reactionData) {
              // 「質問を送信」ボタンが押された場合のみ投稿
              handleFinalSubmit(reactionData)
            } else {
              // 左上の「×」ボタンが押された場合は投稿をキャンセルしてリセット
              reset()
            }
          }}
        />
      )}

      {uploading && (
        <div style={styles.loadingOverlay}>
          <Loader2 size={48} className="animate-spin-custom" />
          <p style={{ marginTop: 12 }}>アップロード中...</p>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-spin-custom { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  )
}

/** =========================
 * DB登録用
 * ========================= */

async function createPostAndReturnId(imageUrl: string, isAnonymous: boolean) {
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data } = await supabase.auth.getUser()
  const user = data.user!

  const { data: inserted } = await supabase
    .from('posts')
    .insert({
      user_id: user.id,
      type: 'problem',
      image_url: imageUrl,
      is_anonymous: isAnonymous,
    })
    .select('id')
    .single()

  await supabase
    .from('posts')
    .update({ root_id: inserted.id })
    .eq('id', inserted.id)

  return inserted.id
}

async function createAnswerAndReturnId(
  imageUrl: string,
  problemId: string,
  isAnonymous: boolean
) {
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data } = await supabase.auth.getUser()
  const user = data.user!

  const { data: inserted } = await supabase
    .from('posts')
    .insert({
      user_id: user.id,
      type: 'answer',
      image_url: imageUrl,
      parent_id: problemId,
      root_id: problemId,
      is_anonymous: isAnonymous,
    })
    .select('id')
    .single()

  return inserted.id
}

/** ========================= */

const styles: { [key: string]: CSSProperties } = {
  wrapper: {
    minHeight: '100vh',
    paddingTop: 32,
    paddingBottom: 54,
    background: '#fff',
  },
  header: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    background: '#111',
    zIndex: 1000,
    cursor: 'pointer',
    paddingLeft: 16,
  },
  logo: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#fff',
  },
  main: {
    paddingBottom: 16,
  },
  footer: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: 54,
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    background: '#111',
    zIndex: 1000,
  },
  icon: {
    background: 'none',
    border: 'none',
    color: '#eee',
  },
  plus: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    border: '3px solid #444',
    color: '#eee',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.8)',
    zIndex: 3000,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    background: '#111',
    padding: 24,
    borderRadius: 12,
    color: '#fff',
    textAlign: 'center',
    minWidth: 280,
  },
  selectBtn: {
    background: '#00aaff',
    color: '#fff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: 8,
    fontWeight: 'bold',
    fontSize: 16,
    cursor: 'pointer',
    width: '100%',
  },
  loadingOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    zIndex: 5000,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#fff',
  },
}