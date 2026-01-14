'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import type { CSSProperties } from 'react'
import { SendHorizontal, Loader2, RotateCw } from 'lucide-react'

type Props = {
  file: File
  uploading: boolean
  onCancel: () => void
  onPost: (editedFile: File) => void
}

type Crop = { x: number; y: number; w: number; h: number }
type Handle = 'top' | 'right' | 'bottom' | 'left'

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
  const [activeHandle, setActiveHandle] = useState<Handle | null>(null)

  // メモリリーク防止のためURLをメモ化
  const imageUrl = useMemo(() => URL.createObjectURL(file), [file])

  useEffect(() => {
    const img = imgRef.current
    if (!img) return

    const handleLoad = () => {
      const w = img.clientWidth * 0.8
      const h = img.clientHeight * 0.8
      setCrop({
        x: (img.parentElement!.clientWidth - w) / 2,
        y: (img.parentElement!.clientHeight - h) / 2,
        w,
        h,
      })
    }

    if (img.complete) handleLoad()
    else img.onload = handleLoad

    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl)
    }
  }, [imageUrl])

  /* -------- ドラッグ操作 -------- */

  const startDrag = (e: React.PointerEvent, h: Handle) => {
    e.preventDefault()
    e.stopPropagation()
    // ポインターをキャプチャして、指が要素から外れてもイベントを追いかける
    ;(e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId)
    setActiveHandle(h)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!crop || !activeHandle || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setCrop((c) => {
      if (!c) return c
      switch (activeHandle) {
        case 'top':
          return { ...c, y: y, h: Math.max(20, c.y + c.h - y) }
        case 'bottom':
          return { ...c, h: Math.max(20, y - c.y) }
        case 'left':
          return { ...c, x: x, w: Math.max(20, c.x + c.w - x) }
        case 'right':
          return { ...c, w: Math.max(20, x - c.x) }
        default:
          return c
      }
    })
  }

  const stopDrag = (e: React.PointerEvent) => {
    if (activeHandle) {
      ;(e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId)
      setActiveHandle(null)
    }
  }

  /* -------- 投稿処理 -------- */

  async function handlePost() {
    if (!crop || !imgRef.current) return

    const img = imgRef.current
    // 画像が中央に配置されているためのオフセットを計算
    const rect = img.getBoundingClientRect()
    const containerRect = containerRef.current!.getBoundingClientRect()
    
    const offsetX = rect.left - containerRect.left
    const offsetY = rect.top - containerRect.top

    const scaleX = img.naturalWidth / img.clientWidth
    const scaleY = img.naturalHeight / img.clientHeight

    const canvas = document.createElement('canvas')
    canvas.width = crop.w * scaleX
    canvas.height = crop.h * scaleY

    const ctx = canvas.getContext('2d')!
    ctx.drawImage(
      img,
      (crop.x - offsetX) * scaleX,
      (crop.y - offsetY) * scaleY,
      crop.w * scaleX,
      crop.h * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    )

    const blob = await new Promise<Blob>((r) =>
      canvas.toBlob((b) => r(b!), 'image/jpeg', 0.9)
    )

    onPost(new File([blob], file.name, { type: 'image/jpeg' }))
  }

  return (
    <div style={styles.overlay} onClick={onCancel}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <button onClick={onCancel} style={styles.closeBtn}>×</button>
          <div style={{ display: 'flex', gap: 20 }}>
            <button onClick={() => setRotation((r) => (r + 90) % 360)} style={styles.actionBtn}>
              <RotateCw size={24} />
            </button>
            <button onClick={handlePost} disabled={uploading} style={styles.actionBtn}>
              {uploading ? <Loader2 className="animate-spin" /> : <SendHorizontal size={24} />}
            </button>
          </div>
        </div>

        <div
          ref={containerRef}
          style={styles.body}
        >
          <img
            ref={imgRef}
            src={imageUrl}
            alt="editor"
            style={{
              maxWidth: '90%',
              maxHeight: '80%',
              transform: `rotate(${rotation}deg)`,
              userSelect: 'none',
              pointerEvents: 'none', // 画像自体のドラッグを防止
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
                  onPointerDown={(e) => startDrag(e, h)}
                  onPointerMove={onPointerMove}
                  onPointerUp={stopDrag}
                  style={{ ...styles.handleContainer, ...handlePos[h] }}
                >
                  <div style={styles.handleVisual} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const styles: { [k: string]: CSSProperties } = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: '#000',
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
    height: 60,
    padding: '0 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(255,255,255,0.05)',
  },
  closeBtn: { background: 'none', border: 'none', color: '#fff', fontSize: 32 },
  actionBtn: { background: 'none', border: 'none', color: '#fff' },
  body: {
    flex: 1,
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    touchAction: 'none', // ブラウザのスクロール等を無効化
  },
  crop: {
    position: 'absolute',
    border: '2px solid #00aaff',
    boxSizing: 'border-box',
    boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)', // 枠の外を暗くする
  },
  handleContainer: {
    position: 'absolute',
    width: 44, // タッチしやすいようにヒットエリアを拡大
    height: 44,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    touchAction: 'none',
    zIndex: 10,
  },
  handleVisual: {
    width: 14,
    height: 14,
    background: '#00aaff',
    borderRadius: '50%',
    border: '2px solid #fff',
  },
}

const handlePos: Record<Handle, CSSProperties> = {
  top: { left: '50%', top: 0, transform: 'translate(-50%, -50%)' },
  right: { left: '100%', top: '50%', transform: 'translate(-50%, -50%)' },
  bottom: { left: '50%', top: '100%', transform: 'translate(-50%, -50%)' },
  left: { left: 0, top: '50%', transform: 'translate(-50%, -50%)' },
}