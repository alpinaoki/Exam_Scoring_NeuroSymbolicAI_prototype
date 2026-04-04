'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useRef, useState, useEffect, useMemo } from 'react'
import type { ReactNode, CSSProperties } from 'react'
import { uploadImageToCloudinary } from '../lib/upload'
import {
  UserRound,
  Sparkles,
  Search,
  BarChart3,
  HelpCircle,
  SendHorizontal,
  Loader2,
  RotateCw,
  Sun,
  Contrast,
  Star,
  AlertTriangle,
  X,
  Send,
} from 'lucide-react'

type Props = {
  children: ReactNode
}

export default function LayoutShell({ children }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  const cameraInputRef = useRef<HTMLInputElement>(null)

  /** =========================
   *  状態（そのまま）
   *  ========================= */
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0)

  const [problemFile, setProblemFile] = useState<File | null>(null)
  const [answerFile, setAnswerFile] = useState<File | null>(null)

  const [problemUrl, setProblemUrl] = useState<string | null>(null)
  const [answerUrl, setAnswerUrl] = useState<string | null>(null)

  const [problemId, setProblemId] = useState<string | null>(null)
  const [answerId, setAnswerId] = useState<string | null>(null)

  const [uploading, setUploading] = useState(false)

  /** ========================= */

  if (
    pathname === '/login' ||
    pathname === '/terms' ||
    pathname.startsWith('/threads')
  ) {
    return <>{children}</>
  }

  /** =========================
   *  Step制御（そのまま）
   *  ========================= */

  const openFlow = () => setStep(1)

  const reset = () => {
    setStep(0)
    setProblemFile(null)
    setAnswerFile(null)
    setProblemUrl(null)
    setAnswerUrl(null)
    setProblemId(null)
    setAnswerId(null)
  }

  /** =========================
   * 投稿処理（そのまま）
   * ========================= */

  const handlePostProblem = async (file: File) => {
    setUploading(true)
    const url = await uploadImageToCloudinary(file)
    const id = await createPostAndReturnId(url)
    setProblemUrl(url)
    setProblemId(id)
    setUploading(false)
    setStep(2)
  }

  const handlePostAnswer = async (file: File) => {
    if (!problemId) return
    setUploading(true)
    const url = await uploadImageToCloudinary(file)
    const id = await createAnswerAndReturnId(url, problemId)
    setAnswerUrl(url)
    setAnswerId(id)
    setUploading(false)
    setStep(3)
  }

  /** ========================= */

  return (
    <div style={styles.wrapper}>
      {/* Header */}
      <header style={styles.header} onClick={() => router.push('/feed')}>
        <span style={styles.logo}>Magmathe</span>
      </header>

      {/* Stepバー */}
      {step > 0 && (
        <div style={styles.stepBar}>
          {['問題', '解答', '質問'].map((label, i) => (
            <div
              key={i}
              style={{
                ...styles.stepItem,
                opacity: step === i + 1 ? 1 : 0.4,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      )}

      {/* Main */}
      <main style={styles.main}>{children}</main>

      {/* Footer */}
      <footer style={styles.footer}>
        <button style={styles.icon} onClick={() => router.push('/feed')}>
          <Sparkles size={28} />
        </button>

        <button style={styles.icon} onClick={() => router.push('/search')}>
          <Search size={28} />
        </button>

        <button style={styles.plus} onClick={openFlow}>
          <HelpCircle size={22} />
        </button>

        <button style={styles.icon} onClick={() => router.push('/analysis')}>
          <BarChart3 size={28} />
        </button>

        <button style={styles.icon} onClick={() => router.push('/me')}>
          <UserRound size={28} />
        </button>
      </footer>

      {/* =========================
          Step① 問題
      ========================= */}
      {step === 1 && (
        <>
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) setProblemFile(f)
            }}
          />

          {!problemFile && (
            <div style={styles.overlay} onClick={reset}>
              <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                <h3>① 問題文を撮影</h3>
                <button onClick={() => cameraInputRef.current?.click()}>
                  画像を選択
                </button>
              </div>
            </div>
          )}

          {problemFile && (
            <InternalImageEditor
              file={problemFile}
              uploading={uploading}
              onCancel={reset}
              onPost={handlePostProblem}
            />
          )}
        </>
      )}

      {/* =========================
          Step② 解答
      ========================= */}
      {step === 2 && (
        <>
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) setAnswerFile(f)
            }}
          />

          {!answerFile && (
            <div style={styles.overlay} onClick={reset}>
              <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                <h3>② 考え方を撮影</h3>
                <button onClick={() => cameraInputRef.current?.click()}>
                  画像を選択
                </button>
                <button
                  onClick={() => {
                    reset()
                    router.refresh()
                  }}
                >
                  スキップ
                </button>
              </div>
            </div>
          )}

          {answerFile && (
            <InternalImageEditor
              file={answerFile}
              uploading={uploading}
              onCancel={reset}
              onPost={handlePostAnswer}
            />
          )}
        </>
      )}

      {/* =========================
          Step③ 質問
      ========================= */}
      {step === 3 && answerUrl && answerId && (
        <InternalReactionEditor
          imageUrl={answerUrl}
          postId={answerId}
          onClose={() => {
            reset()
            router.refresh()
          }}
        />
      )}
    </div>
  )
}

/** =========================
 * 内部 ImageEditor（ほぼ完全コピー）
 * ========================= */

function InternalImageEditor({
  file,
  uploading,
  onCancel,
  onPost,
}: any) {
  const imgRef = useRef<HTMLImageElement>(null)
  const [rotation, setRotation] = useState(0)
  const [brightness, setBrightness] = useState(1)
  const [contrast, setContrast] = useState(1)

  const imageUrl = useMemo(() => URL.createObjectURL(file), [file])

  const handlePost = async () => {
    if (!imgRef.current) return

    const canvas = document.createElement('canvas')
    canvas.width = imgRef.current.naturalWidth
    canvas.height = imgRef.current.naturalHeight
    const ctx = canvas.getContext('2d')!

    ctx.filter = `brightness(${brightness}) contrast(${contrast})`
    ctx.drawImage(imgRef.current, 0, 0)

    const blob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.8)
    )

    onPost(new File([blob], 'image.jpg'))
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.fullModal}>
        <img
          ref={imgRef}
          src={imageUrl}
          style={{
            maxWidth: '90%',
            transform: `rotate(${rotation}deg)`,
          }}
        />

        <div>
          <button onClick={() => setRotation((r) => r + 90)}>
            <RotateCw />
          </button>
          <button onClick={handlePost}>
            {uploading ? <Loader2 /> : <SendHorizontal />}
          </button>
        </div>
      </div>
    </div>
  )
}

/** =========================
 * 内部 ReactionEditor（ほぼコピー）
 * ========================= */

function InternalReactionEditor({ imageUrl, postId, onClose }: any) {
  const [pos, setPos] = useState<any>(null)
  const [type, setType] = useState<'star' | 'exclamation' | 'question'>('star')
  const [comment, setComment] = useState('')

  return (
    <div style={styles.overlay}>
      <img
        src={imageUrl}
        style={{ width: '100%' }}
        onClick={(e: any) => {
          setPos({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY })
        }}
      />

      <input value={comment} onChange={(e) => setComment(e.target.value)} />

      <button onClick={onClose}>
        <Send />
      </button>
    </div>
  )
}

/** ========================= */

async function createPostAndReturnId(imageUrl: string) {
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
  problemId: string
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
    })
    .select('id')
    .single()

  return inserted.id
}

/** ========================= */

const styles: { [key: string]: CSSProperties } = {
  wrapper: { minHeight: '100vh', paddingTop: 32, paddingBottom: 54 },
  header: {
    position: 'fixed',
    top: 0,
    height: 32,
    background: '#111',
    color: '#fff',
  },
  stepBar: {
    position: 'fixed',
    top: 32,
    width: '100%',
    display: 'flex',
    justifyContent: 'space-around',
    background: '#000',
    color: '#fff',
  },
  stepItem: { padding: 8 },
  main: { paddingTop: 60 },
  footer: {
    position: 'fixed',
    bottom: 0,
    width: '100%',
    display: 'flex',
    justifyContent: 'space-around',
    background: '#111',
  },
  icon: { background: 'none', border: 'none', color: '#fff' },
  plus: { borderRadius: '50%' },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: '#000',
  },
  modal: { background: '#111', padding: 24, color: '#fff' },
  fullModal: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
}