'use client'
import { useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { uploadImageToCloudinary } from '../lib/upload'
import { createAnswer } from '../lib/posts'
import ImageEditorModal from './ImageEditorModal'
import { Lightbulb, Camera } from 'lucide-react' // Cameraアイコン追加
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
          <div style={styles.iconContainer}>
            <Lightbulb size={22} style={styles.filledLightbulb} />
          </div>
          <div style={styles.textContainer}>
            <span style={styles.countText}>{answerCount}件のひらめき</span>
            <span style={styles.promptText}>解答・アイデアを投稿する</span>
          </div>
          <Camera size={20} style={styles.cameraIcon} />
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
            await createAnswer({
              imageUrl,
              problemId,
              rootId,
              anonymous,
            })

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
    padding: '12px 0',
    display: 'flex',
    justifyContent: 'center',
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    background: '#ffffff',
    border: '2px solid #fad646',
    borderRadius: '16px',
    padding: '10px 20px',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(250, 214, 70, 0.2)',
    transition: 'transform 0.1s ease',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'left',
  },
  iconContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#fff9e6',
    borderRadius: '12px',
    width: '44px',
    height: '44px',
  },
  filledLightbulb: {
    fill: '#fad646',
    color: '#e6be00',
  },
  textContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  countText: {
    fontSize: '12px',
    fontWeight: 700,
    color: '#888',
    marginBottom: '2px',
  },
  promptText: {
    fontSize: '15px',
    fontWeight: 800,
    color: '#333',
  },
  cameraIcon: {
    color: '#bbb',
  },
}