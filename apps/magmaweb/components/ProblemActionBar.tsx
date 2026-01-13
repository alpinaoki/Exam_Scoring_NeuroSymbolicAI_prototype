'use client'
import { useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { uploadImageToCloudinary } from '../lib/upload'
import { createAnswer } from '../lib/posts'
import ImageEditorModal from './ImageEditorModal'
import { Lightbulb, Heart } from 'lucide-react'
type Props = {
  problemId: string
  rootId: string
  bookmarkCount: number
  answerCount: number
}
export default function ProblemActionBar({
  problemId,
  rootId,
  bookmarkCount,
  answerCount,
}: Props) {
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  return (
    <>
      <div style={styles.bar}>
        {/* 解答（＋カメラ） */}
        <button
          style={styles.action}
          onClick={() => cameraInputRef.current?.click()}
        >
          <Lightbulb size={20} style={styles.filledLightbulb}/>
          <span>解答 {answerCount}</span>
        </button>
        {/* いいね（現状そのまま） */}
        <span style={styles.action}>
          <Heart size={20} />
          <span>いいね {bookmarkCount}</span>
        </span>
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
          onPost={async () => {
            if (uploading) return
            setUploading(true)
            const imageUrl = await uploadImageToCloudinary(file)
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
    gap: 24, // 少し広げるとボタン同士が判別しやすくなります
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
    // --- ここから追加 ---
    fontSize: 'inherit',   // 親の文字サイズを引き継ぐ
    fontFamily: 'inherit', // 親のフォント種類を引き継ぐ
    lineHeight: 1,         // 行の高さを揃えて垂直中央を安定させる
    // -------------------
  },
  filledLightbulb: {
    fill: '#fad646', // 黄色で塗りつぶし (Tailwindのyellow-400相当)
  },
  filledHeart: {
    fill: '#EF4444', // 赤色で塗りつぶし (Tailwindのred-500相当)
  },
}