'use client'

import { useEffect, useRef, useState } from 'react'

type Props = {
  file: File
  uploading: boolean
  onCancel: () => void
  onPost: (editedFile: File, anonymous: boolean) => void
}

export default function ImageEditorModal({
  file,
  uploading,
  onCancel,
  onPost,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [anonymous, setAnonymous] = useState(false)

  useEffect(() => {
    const img = new Image()
    img.src = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
    }
  }, [file])

  async function handlePost() {
    const canvas = canvasRef.current
    if (!canvas) return

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg')
    )
    if (!blob) return

    const editedFile = new File([blob], file.name, { type: 'image/jpeg' })
    onPost(editedFile, anonymous)
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <canvas ref={canvasRef} style={styles.canvas} />

        <div style={styles.controls}>
          <label style={styles.checkbox}>
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
            />
            匿名で解答する
          </label>

          <div style={styles.buttons}>
            <button onClick={onCancel} disabled={uploading}>
              キャンセル
            </button>
            <button onClick={handlePost} disabled={uploading}>
              投稿
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '90%',
    maxWidth: 600,
  },
  canvas: {
    width: '100%',
    borderRadius: 8,
    border: '1px solid #eee',
  },
  controls: {
    marginTop: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  checkbox: {
    fontSize: 13,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 8,
  },
}
