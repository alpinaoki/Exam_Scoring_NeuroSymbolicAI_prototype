'use client'
import { useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { uploadImageToCloudinary } from '../lib/upload'
import { createAnswer } from '../lib/posts'
import ImageEditorModal from './ImageEditorModal'
import { Lightbulb } from 'lucide-react'

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

  return (
    <>
      <div style={styles.bar}>
        {/* 解答投稿 */}
        <button
          style={styles.action}
          onClick={() => cameraInputRef.current?.click()}
        >
          <Lightbulb size={20} style={styles.filledLightbulb} />
          <span>解答 {answerCount}</span>
        </button>
      </div>

      {/* hidden camera input */}
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

      {/* Image Editor */}
      {file && (
        <ImageEditorModal
          file={file}
          uploading={uploading}
          onCancel={() => {
            if (!uploading) setFile(null)
          }}
          onPost={async (editedFile) => {
            if (uploading) return
            setUploading(true)

            const imageUrl = await uploadImageToCloudinary(editedFile)
            await createAnswer({ imageUrl, problemId, rootId })

            setUploading(false)
            setFile(null)
          }}
        />
      )}
    </>
  )
}

const styles: { [key: string]: CSSProperties } = {
  bar: {
    display: 'flex',
    alignItems: 'center',
    gap: 24,
    color: 'black',
  },
  action: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'black',
    padding: 0,
    fontSize: 'inherit',
    fontFamily: 'inherit',
    lineHeight: 1,
  },
  filledLightbulb: {
    fill: '#fad646',
  },
}
