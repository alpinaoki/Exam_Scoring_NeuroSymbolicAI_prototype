'use client'

import { useState } from 'react'
import ImageEditorModal from './ImageEditorModal'
import { uploadImageToCloudinary } from '../lib/upload'
import { createAnswer } from '../lib/posts'

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
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  return (
    <>
      <div style={styles.bar}>
        <label style={styles.button}>
          ＋ 解答
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) setFile(f)
            }}
          />
        </label>

        <span style={styles.count}>{answerCount} 件</span>
      </div>

      {file && (
        <ImageEditorModal
          file={file}
          uploading={uploading}
          onCancel={() => {
            if (!uploading) setFile(null)
          }}
          onPost={async (editedFile, anonymous) => {
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
          }}
        />
      )}
    </>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  bar: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  button: {
    cursor: 'pointer',
    fontSize: 13,
    color: '#0070f3',
  },
  count: {
    fontSize: 12,
    color: '#666',
  },
}
