'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import type { ReactNode, CSSProperties } from 'react'
import { createPost, createAnswer } from '../lib/posts'
import { uploadImageToCloudinary } from '../lib/upload'
import ImageEditorModal from './ImageEditorModal'
import ReactionEditorModal from './ReactionEditorModal'
import {
  UserRound,
  Sparkles,
  Search,
  BarChart3,
  HelpCircle,
} from 'lucide-react'

type Props = {
  children: ReactNode
}

export default function LayoutShell({ children }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  const cameraInputRef = useRef<HTMLInputElement>(null)

  /** =========================
   *  状態（ここが核心）
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
   *  Step制御
   *  ========================= */

  const openFlow = () => {
    setStep(1)
  }

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
   *  投稿処理
   *  ========================= */

  const handlePostProblem = async (file: File) => {
    setUploading(true)

    const url = await uploadImageToCloudinary(file)
    const id = await createPostAndReturnId(url)

    setProblemUrl(url)
    setProblemId(id)

    setUploading(false)

    // 次へ
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

    // 質問へ
    setStep(3)
  }

  /** ========================= */

  return (
    <div style={styles.wrapper}>
      {/* Header */}
      <header style={styles.header} onClick={() => router.push('/feed')}>
        <span style={styles.logo}>Magmathe</span>
      </header>

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

        {/* ★ 中央ボタン */}
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
            
            <ImageEditorModal
              file={problemFile}
              uploading={uploading}
              anonymous={false}
              showAnonymous={false}
              onAnonymousChange={() => {}}
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
                    // スキップ → 即投稿
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
            <ImageEditorModal
              file={answerFile}
              uploading={uploading}
              anonymous={false}
              showAnonymous={false}
              onAnonymousChange={() => {}}
              onCancel={reset}
              onPost={handlePostAnswer}
            />
          )}
        </>
      )}

      {/* =========================
          Step③ 質問（解答にのみ）
      ========================= */}
      {step === 3 && answerUrl && answerId && (
        <ReactionEditorModal
          open={true}
          imageUrl={answerUrl}
          postId={answerId}
          username={'me'}
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
 * ID返す用（重要）
 * ========================= */

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
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: '#000',
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
  },
}