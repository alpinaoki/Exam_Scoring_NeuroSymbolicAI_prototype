'use client'
import { useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { uploadImageToCloudinary } from '../lib/upload'
import { createAnswer } from '../lib/posts'
import ImageEditorModal from './ImageEditorModal'
import { Lightbulb, Plus } from 'lucide-react' // Plusアイコンで「追加」を表現
import { useRouter } from 'next/navigation'

type Props = {
  problemId: string
  rootId: string
  answerCount: number
}

export default function ProblemActionBar({
  problemId,
  rootId,
  answerCount,
}: Props) {
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [anonymous, setAnonymous] = useState(false)
  const router = useRouter()

  return (
    <>
      <div style={styles.bar}>
        <button
          style={styles.actionButton}
          onClick={() => cameraInputRef.current?.click()}
        >
          <div style={styles.leftPart}>
            <Lightbulb size={16} style={styles.filledLightbulb} />
            <span style={styles.countText}>{answerCount}件の解答</span>
          </div>
          <div style={styles.divider} />
          <div style={styles.rightPart}>
            <Plus size={16} />
            <span>解答を投稿</span>
          </div>
        </button>
      </div>

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) setFile(f)
        }}
      />

      {/* モダール部分は変更なし */}
      {file && (
        <ImageEditorModal
          file={file}
          uploading={uploading}
          anonymous={anonymous}
          onAnonymousChange={setAnonymous}
          onCancel={() => {
            if (!uploading) {
              setFile(null)
              setAnonymous(false)
            }
          }}
          onPost={async (editedFile) => {
            if (uploading) return
            setUploading(true)
            const imageUrl = await uploadImageToCloudinary(editedFile)
            await createAnswer({ imageUrl, problemId, rootId, anonymous })
            setUploading(false)
            setFile(null)
            setAnonymous(false)
            router.push(`/threads/${rootId}`)
            router.refresh()
          }}
        />
      )}
    </>
  )
}

const styles: { [key: string]: CSSProperties } = {
  bar: {
    display: 'flex',
    justifyContent: 'flex-start', // 左寄せで「カードの続き」感を出す
    padding: '8px 0',
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    background: '#fff',
    border: '1.5px solid #eee',
    borderRadius: '20px',
    padding: '0 4px 0 12px', // 右側のボタン感を出すため
    height: '36px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 600,
    color: '#555',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
  },
  leftPart: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingRight: 10,
  },
  filledLightbulb: {
    fill: '#fad646',
    color: '#e6be00',
  },
  divider: {
    width: '1px',
    height: '16px',
    background: '#eee',
  },
  rightPart: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: '0 12px',
    color: '#4D96FF', // アクション部分は青色で目立たせる
  },
  countText: {
    color: '#888',
  }
}