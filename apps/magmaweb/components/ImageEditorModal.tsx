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

type Crop = { x: number; y: number; w: number; h: number }
type Handle = 'top' | 'right' | 'bottom' | 'left' | null

export default function ImageEditorModal({
  file,
  uploading,
  onCancel,
  onPost,
}: Props) {
  const imgRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [rotation, setRotation] = useState(0)
  const [crop, setCrop] = useState<Crop | null>(null)
  const [activeHandle, setActiveHandle] = useState<Handle>(null)

  /* 初期 crop（画像中央） */
  useEffect(() => {
    const img = imgRef.current
    if (!img) return

    img.onload = () => {
      const w = img.clientWidth * 0.7
      const h = img.clientHeight * 0.7
      setCrop({
        x: (img.clientWidth - w) / 2,
        y: (img.clientHeight - h) / 2,
        w,
        h,
      })
    }
  }, [file])

  /* -------- touch / pointer -------- */

  function onPointerMove(e: React.PointerEvent) {
    if (!crop || !activeHandle) return

    const rect = containerRef.current!.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setCrop((c) => {
      if (!c) return c
      switch (activeHandle) {
        case 'top':
          return { ...c, y: y, h: c.y + c.h - y }
        case 'bottom':
          return { ...c, h: y - c.y }
        case 'left':
          return { ...c, x: x, w: c.x + c.w - x }
        case 'right':
          return { ...c, w: x - c.x }
        default:
          return c
      }
    })
  }

  function stopDrag() {
    setActiveHandle(null)
  }

  /* -------- 投稿 -------- */

  async function handlePost() {
    if (!crop || !imgRef.current) return

    const img = imgRef.current
    const scaleX = img.naturalWidth / img.clientWidth
    const scaleY = img.naturalHeight / img.clientHeight

    const canvas = document.createElement('canvas')
    canvas.width = crop.w * scaleX
    canvas.height = crop.h * scaleY

    const ctx = canvas.getContext('2d')!
    ctx.drawImage(
      img,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.w * scaleX,
      crop.h * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    )

    const blob = await new Promise<Blob>((r) =>
      canvas.toBlob((b) => r(b!), 'image/jpeg')
    )

    onPost(new File([blob], file.name, { type: 'image/jpeg' }))
  }

  /* -------- UI -------- */

  const imageUrl = URL.createObjectURL(file)

  return (
    <div style={styles.overlay} onClick={onCancel}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <button onClick={onCancel}>×</button>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => setRotation((r) => (r + 90) % 360)}>
              <RotateCw size={20} />
            </button>
            <button onClick={handlePost} disabled={uploading}>
              {uploading ? <Loader2 className="animate-spin" /> : <SendHorizontal />}
            </button>
          </div>
        </div>

        <div
          ref={containerRef}
          style={styles.body}
          onPointerMove={onPointerMove}
          onPointerUp={stopDrag}
        >
          <img
            ref={imgRef}
            src={imageUrl}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              transform: `rotate(${rotation}deg)`,
            }}
          />

          {crop && (
            <div
              style={{
                ...styles.crop,
                left: crop.x,
                top: crop.y,
                width: crop.w,
                height: crop.h,
              }}
            >
              {(['top', 'right', 'bottom', 'left'] as Handle[]).map((h) => (
                <div
                  key={h}
                  onPointerDown={() => setActiveHandle(h)}
                  style={{ ...styles.handle, ...handlePos[h!] }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ---------------- styles ---------------- */

const styles: { [k: string]: CSSProperties } = {
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  body: {
    flex: 1,
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    touchAction: 'none',
  },
  crop: {
    position: 'absolute',
    border: '2px solid #00aaff',
    boxSizing: 'border-box',
  },
  handle: {
    position: 'absolute',
    width: 20,
    height: 20,
    background: '#00aaff',
    borderRadius: '50%',
    transform: 'translate(-50%, -50%)',
    touchAction: 'none',
  },
}

const handlePos: Record<'top' | 'right' | 'bottom' | 'left', CSSProperties> = {
  top: { left: '50%', top: 0 },
  right: { left: '100%', top: '50%' },
  bottom: { left: '50%', top: '100%' },
  left: { left: 0, top: '50%' },
}
