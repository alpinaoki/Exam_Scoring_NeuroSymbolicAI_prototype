'use client'

import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { SendHorizontal, Loader2, RotateCw } from 'lucide-react'

type Props = {
  file: File
  uploading: boolean
  onCancel: () => void
  onPost: (editedFile: File) => void
}

export default function ImageEditorModal({
  file,
  uploading,
  onCancel,
  onPost,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)

  const [rotation, setRotation] = useState(0)
  const [crop, setCrop] = useState<{
    x: number
    y: number
    w: number
    h: number
  } | null>(null)

  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(
    null
  )

  /* ------------------ 画像読み込み ------------------ */

  useEffect(() => {
    const img = new Image()
    img.src = URL.createObjectURL(file)
    img.onload = () => {
      imageRef.current = img
      draw()
    }
  }, [file, rotation])

  /* ------------------ 描画 ------------------ */

  function draw() {
    const canvas = canvasRef.current
    const img = imageRef.current
    if (!canvas || !img) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = Math.max(img.width, img.height)
    canvas.width = size
    canvas.height = size

    ctx.clearRect(0, 0, size, size)

    ctx.save()
    ctx.translate(size / 2, size / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.drawImage(img, -img.width / 2, -img.height / 2)
    ctx.restore()

    // トリミング枠
    if (crop) {
      ctx.strokeStyle = '#00aaff'
      ctx.lineWidth = 2
      ctx.strokeRect(crop.x, crop.y, crop.w, crop.h)
    }
  }

  /* ------------------ マウス操作 ------------------ */

  function getPos(e: React.MouseEvent) {
    const rect = canvasRef.current!.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  function onMouseDown(e: React.MouseEvent) {
    const p = getPos(e)
    setDragStart(p)
    setCrop({ x: p.x, y: p.y, w: 0, h: 0 })
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!dragStart) return
    const p = getPos(e)
    setCrop({
      x: Math.min(dragStart.x, p.x),
      y: Math.min(dragStart.y, p.y),
      w: Math.abs(p.x - dragStart.x),
      h: Math.abs(p.y - dragStart.y),
    })
  }

  function onMouseUp() {
    setDragStart(null)
  }

  useEffect(() => {
    draw()
  }, [crop])

  /* ------------------ 投稿処理 ------------------ */

  async function handlePost() {
    if (!crop || !imageRef.current) return

    const out = document.createElement('canvas')
    out.width = crop.w
    out.height = crop.h

    const ctx = out.getContext('2d')!
    ctx.drawImage(
      canvasRef.current!,
      crop.x,
      crop.y,
      crop.w,
      crop.h,
      0,
      0,
      crop.w,
      crop.h
    )

    const blob = await new Promise<Blob>((resolve) =>
      out.toBlob((b) => resolve(b!), 'image/jpeg')
    )

    const editedFile = new File([blob], file.name, { type: 'image/jpeg' })
    onPost(editedFile)
  }

  /* ------------------ UI ------------------ */

  return (
    <div style={styles.overlay} onClick={onCancel}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <button onClick={onCancel} style={styles.closeButton}>×</button>

          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => setRotation((r) => (r + 90) % 360)}>
              <RotateCw size={20} />
            </button>

            <button
              onClick={handlePost}
              disabled={uploading || !crop}
              style={{ opacity: uploading ? 0.5 : 1 }}
            >
              {uploading ? (
                <Loader2 className="animate-spin" size={22} />
              ) : (
                <SendHorizontal size={22} />
              )}
            </button>
          </div>
        </div>

        <div style={styles.body}>
          <canvas
            ref={canvasRef}
            style={styles.canvas}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
          />
        </div>
      </div>
    </div>
  )
}

/* ------------------ styles ------------------ */

const styles: { [key: string]: CSSProperties } = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.9)',
    zIndex: 3000,
  },
  modal: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    color: '#fff',
  },
  header: {
    height: 48,
    padding: '0 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid #333',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: 24,
    color: '#fff',
    cursor: 'pointer',
  },
  body: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  canvas: {
    maxWidth: '100%',
    maxHeight: '100%',
    cursor: 'crosshair',
  },
}
