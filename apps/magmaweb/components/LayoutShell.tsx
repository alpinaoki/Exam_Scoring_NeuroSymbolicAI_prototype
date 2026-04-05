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

  const [step, setStep] = useState<0 | 1 | 2 | 3>(0)
  const [direction, setDirection] = useState<'in' | 'out'>('in') 
  const [rawFile, setRawFile] = useState<File | null>(null)
  const [problemFile, setProblemFile] = useState<File | null>(null)
  const [answerFile, setAnswerFile] = useState<File | null>(null)
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [uploading, setUploading] = useState(false)

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

  if (pathname === '/login' || pathname === '/terms' || pathname.startsWith('/threads')) {
    return <>{children}</>
  }

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

      const pUrl = await uploadImageToCloudinary(problemFile)
      const { data: pInserted, error: pError } = await supabase
        .from('posts')
        .insert({
          user_id: userId,
          type: 'problem',
          image_url: pUrl,
          anonymous: isAnonymous, 
        })
        .select('id').single()

      if (pError || !pInserted) throw pError
      const pId = pInserted.id
      await supabase.from('posts').update({ root_id: pId }).eq('id', pId)

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
          .select('id').single()

        if (aError || !aInserted) throw aError
        const aId = aInserted.id

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
      alert('投稿に失敗しました。\n' + (error.message || 'Unknown Error'))
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
        <button style={styles.plus} onClick={() => goToStep(1)}><HelpCircle size={22} /></button>
        <button style={styles.icon} onClick={() => router.push('/analysis')}><BarChart3 size={28} /></button>
        <button style={styles.icon} onClick={() => router.push('/me')}><UserRound size={28} /></button>
      </footer>

      {step > 0 && (
        <div style={styles.fullOverlay}>
          {/* 進捗バー：常に最前面 */}
          <div style={styles.progressContainer}>
            <button onClick={() => {
                if (rawFile) setRawFile(null); 
                else if (step > 1) goToStep((step - 1) as any);
                else reset();
            }} style={styles.navBtn}>
              <X size={20} />
            </button>
            <div style={styles.progressBars}>
              {[1, 2, 3].map((s) => (
                <div key={s} style={styles.progressBarBase}>
                  <div style={{
                    ...styles.progressBarFill,
                    width: step > s ? '100%' : step === s ? '10%' : '0%',
                    opacity: step >= s ? 1 : 0.3
                  }} />
                </div>
              ))}
            </div>
            <div style={{ width: 32 }} /> 
          </div>

          <div className={direction === 'in' ? 'slide-in' : 'slide-out'} style={styles.stepContent}>
            {step === 1 && (
              <div style={styles.stepContainer}>
                {!rawFile ? (
                  <>
                    <h2 style={styles.stepTitle}>問題文を撮影</h2>
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
                      setProblemFile(editedFile); setRawFile(null); goToStep(2);
                    }}
                  />
                )}
              </div>
            )}

            {step === 2 && (
              <div style={styles.stepContainer}>
                {!rawFile ? (
                  <>
                    <h2 style={styles.stepTitle}>自分の考えを撮影</h2>
                    <button style={styles.mainActionBtn} onClick={() => cameraInputRef.current?.click()}>
                      <Camera size={24} /> カメラを起動
                    </button>
                    <button style={styles.skipBtn} onClick={() => handleFinalSubmit()}>
                      スキップして投稿
                    </button>
                  </>
                ) : (
                  <ImageEditorModal
                    file={rawFile}
                    anonymous={isAnonymous}
                    onAnonymousChange={setIsAnonymous}
                    onCancel={() => setRawFile(null)}
                    onConfirm={(editedFile) => {
                      setAnswerFile(editedFile); setRawFile(null); goToStep(3);
                    }}
                    showAnonymous={false}
                  />
                )}
              </div>
            )}

            {step === 3 && answerFile && (
              <ReactionEditorModal
                open={true}
                imageUrl={URL.createObjectURL(answerFile)}
                postId="temp"
                username="me"
                onClose={(reactionData) => {
                  if (reactionData) handleFinalSubmit(reactionData);
                  else goToStep(2);
                }}
              />
            )}
          </div>

          <input ref={cameraInputRef} type="file" accept="image/*" hidden
            onChange={(e) => { const f = e.target.files?.[0]; if (f) setRawFile(f); }}
          />
        </div>
      )}
    </div>
  )
}

const styles: { [key: string]: CSSProperties } = {
  wrapper: { minHeight: '100vh', paddingTop: 32, paddingBottom: 54, background: '#fff' },
  header: { position: 'fixed', top: 0, left: 0, right: 0, height: 32, display: 'flex', alignItems: 'center', background: '#111', zIndex: 1000, cursor: 'pointer', paddingLeft: 16 },
  logo: { fontWeight: 'bold', fontSize: 18, color: '#fff' },
  main: { paddingBottom: 16 },
  footer: { position: 'fixed', bottom: 0, left: 0, right: 0, height: 54, display: 'flex', justifyContent: 'space-around', alignItems: 'center', background: '#111', zIndex: 1000 },
  icon: { background: 'none', border: 'none', color: '#eee', cursor: 'pointer' },
  plus: { width: 36, height: 36, borderRadius: '50%', border: '3px solid #444', color: '#eee', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 0, cursor: 'pointer' },
  // zIndexを調整
  fullOverlay: { position: 'fixed', inset: 0, background: '#000', zIndex: 3000, display: 'flex', flexDirection: 'column', color: '#fff' },
  progressContainer: { 
    padding: '12px 16px', 
    display: 'flex', 
    gap: 12, 
    alignItems: 'center', 
    background: '#000', 
    borderBottom: '1px solid #222', 
    zIndex: 10000 // 子要素の中でも絶対に一番上
  },
  progressBars: { flex: 1, display: 'flex', gap: 6 },
  navBtn: { background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 4 },
  progressBarBase: { flex: 1, height: 4, background: '#333', borderRadius: 2, overflow: 'hidden' },
  progressBarFill: { height: '100%', background: '#00aaff', transition: 'width 0.4s ease' },
  stepContent: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', zIndex: 1 },
  stepContainer: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px', textAlign: 'center' },
  stepTitle: { fontSize: 26, fontWeight: 'bold', marginBottom: 12 },
  mainActionBtn: { width: '100%', background: '#00aaff', color: '#fff', border: 'none', padding: '20px', borderRadius: '18px', fontSize: 18, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, cursor: 'pointer' },
  skipBtn: { background: 'transparent', color: '#666', border: 'none', fontSize: 14, textDecoration: 'underline', cursor: 'pointer', marginTop: 8 },
}