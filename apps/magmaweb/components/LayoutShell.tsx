'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useRef, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { ReactNode, CSSProperties } from 'react'
import { uploadImageToCloudinary } from '../lib/upload'
import ImageEditorModal from './ImageEditorModalForLS'
import ReactionEditorModal from './ReactionEditorModalForLS'
import {
  UserRound,
  Sparkles,
  Search,
  BarChart3,
  MessageCircleQuestionIcon,
  X,
  ChevronLeft,
  Camera
} from 'lucide-react'

type Props = {
  children: ReactNode
}

// 🎨 納戸色ベース
const BASE_COLOR = '#2C3E50'     // メイン
const SUB_COLOR = '#34495E'      // 少し明るい
const BORDER_COLOR = '#3d566e'

export default function LayoutShell({ children }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const [mounted, setMounted] = useState(false)

  const [step, setStep] = useState<0 | 1 | 2 | 3>(0)
  const [direction, setDirection] = useState<'in' | 'out'>('in') 
  const [rawFile, setRawFile] = useState<File | null>(null)
  const [problemFile, setProblemFile] = useState<File | null>(null)
  const [answerFile, setAnswerFile] = useState<File | null>(null)
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => { setMounted(true) }, [])

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
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData.user!.id

      const pUrl = await uploadImageToCloudinary(problemFile)

      const { data: pInserted } = await supabase
        .from('posts')
        .insert({
          user_id: userId,
          type: 'problem',
          image_url: pUrl,
          anonymous: isAnonymous,
          label: '質問',
        })
        .select('id').single()

      const pId = pInserted!.id
      await supabase.from('posts').update({ root_id: pId }).eq('id', pId)

      if (answerFile) {
        const aUrl = await uploadImageToCloudinary(answerFile)
        const { data: aInserted } = await supabase
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

        if (reactionData) {
          await supabase.from('reactions').insert({
            post_id: aInserted!.id,
            user_id: userId,
            type: reactionData.type,
            comment: reactionData.comment,
            x_float: reactionData.x,
            y_float: reactionData.y,
          })
        }
      }

      reset()
      router.refresh()
      router.push(`/threads/${pId}`)

    } catch (e: any) {
      alert(e.message)
    } finally {
      setUploading(false)
    }
  }

  const isInitialStep = step === 1 && !rawFile;

  return (
    <div style={styles.wrapper}>
      <header style={styles.header} onClick={() => router.push('/feed')}>
        <span style={styles.logo}>Magmathe</span>
      </header>

      <main style={styles.main}>{children}</main>

      <footer style={styles.footer}>
        <button style={styles.icon} onClick={() => router.push('/feed')}><Sparkles size={28} /></button>
        <button style={styles.icon} onClick={() => router.push('/search')}><Search size={28} /></button>
        <button style={styles.icon} onClick={() => goToStep(1)}>
          <MessageCircleQuestionIcon size={28} />
        </button>
        <button style={styles.icon} onClick={() => router.push('/analysis')}><BarChart3 size={28} /></button>
        <button style={styles.icon} onClick={() => router.push('/me')}><UserRound size={28} /></button>
      </footer>

      {step > 0 && (
        <div style={styles.fullOverlay}>
          {mounted && createPortal(
            <div style={styles.portalProgressContainer}>
              <button onClick={() => {
                if (rawFile) setRawFile(null)
                else if (step > 1) goToStep((step - 1) as any)
                else reset()
              }} style={styles.navBtn}>
                {isInitialStep ? <X size={24} /> : <ChevronLeft size={28} />}
              </button>

              <div style={styles.progressBars}>
                {[1, 2, 3].map((s) => (
                  <div key={s} style={styles.progressBarBase}>
                    <div style={{
                      ...styles.progressBarFill,
                      width: step > s ? '100%' : step === s ? '10%' : '0%',
                    }} />
                  </div>
                ))}
              </div>

              <div style={{ width: 32 }} />
            </div>,
            document.body
          )}

          <div style={styles.stepContent}>
            {/* 省略（中身そのままでOK） */}
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
    </div>
  )
}

const styles: { [key: string]: CSSProperties } = {
  wrapper: {
    minHeight: '100vh',
    paddingTop: 32,
    paddingBottom: 54,
    background: '#f9fafb', // ← 白ズレ防止
  },

  header: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    background: BASE_COLOR,
    zIndex: 1000,
    paddingLeft: 16,
  },

  logo: { color: '#fff', fontWeight: 'bold' },

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
    background: BASE_COLOR,
  },

  icon: {
    background: 'none',
    border: 'none',
    color: '#ddd',
  },

  fullOverlay: {
    position: 'fixed',
    inset: 0,
    background: BASE_COLOR,
    zIndex: 3000,
  },

  portalProgressContainer: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    background: BASE_COLOR,
    borderBottom: `1px solid ${BORDER_COLOR}`,
    zIndex: 99999,
  },

  progressBars: { flex: 1, display: 'flex', gap: 6 },

  navBtn: { background: 'none', border: 'none', color: '#fff' },

  progressBarBase: {
    flex: 1,
    height: 4,
    background: SUB_COLOR,
  },

  progressBarFill: {
    height: '100%',
    background: '#00aaff',
  },

  stepContent: {
    flex: 1,
    paddingTop: 60,
  },
}