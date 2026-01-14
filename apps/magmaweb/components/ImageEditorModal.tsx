'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import type { CSSProperties } from 'react'
import { SendHorizontal, Loader2, RotateCw, Sun } from 'lucide-react'

type Props = {
  file: File
  uploading: boolean
  onCancel: () => void
  onPost: (editedFile: File) => void
}

type Crop = { x: number; y: number; w: number; h: number }
type Handle = 'top' | 'right' | 'bottom' | 'left' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

export default function ImageEditorModal({
  file,
  uploading,
  onCancel,
  onPost,
}: Props) {
  const imgRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [rotation, setRotation] = useState(0)
  const [brightness, setBrightness] = useState(1)
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

  /* -------- ドラッグ操作 (はみ出し防止ロジック) -------- */

  const startDrag = (e: React.PointerEvent, h: Handle) => {
    e.preventDefault()
    e.stopPropagation()
    ;(e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId)
    setActiveHandle(h)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!crop || !activeHandle || !containerRef.current || !imgRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const imgRect = imgRef.current.getBoundingClientRect()

    const pointerX = e.clientX - containerRect.left
    const pointerY = e.clientY - containerRect.top

    // 画像の表示領域の境界を取得
    const imgLeftBound = imgRect.left - containerRect.left
    const imgTopBound = imgRect.top - containerRect.top
    const imgRightBound = imgLeftBound + imgRect.width
    const imgBottomBound = imgTopBound + imgRect.height

    setCrop((c) => {
      if (!c) return c
      let { x: nx, y: ny, w: nw, h: nh } = c

      if (activeHandle.includes('top')) {
        const constrainedY = Math.max(pointerY, imgTopBound)
        ny = constrainedY
        nh = (c.y + c.h) - constrainedY
      }
      if (activeHandle.includes('bottom')) {
        const constrainedY = Math.min(pointerY, imgBottomBound)
        nh = constrainedY - c.y
      }
      if (activeHandle.includes('left')) {
        const constrainedX = Math.max(pointerX, imgLeftBound)
        nx = constrainedX
        nw = (c.x + c.w) - constrainedX
      }
      if (activeHandle.includes('right')) {
        const constrainedX = Math.min(pointerX, imgRightBound)
        nw = constrainedX - c.x
      }

      const finalW = Math.max(20, nw)
      const finalH = Math.max(20, nh)
      const finalX = Math.max(imgLeftBound, Math.min(nx, imgRightBound - finalW))
      const finalY = Math.max(imgTopBound, Math.min(ny, imgBottomBound - finalH))

      return { x: finalX, y: finalY, w: finalW, h: finalH }
    })
  }

  const stopDrag = (e: React.PointerEvent) => {
    if (activeHandle) {
      ;(e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId)
      setActiveHandle(null)
    }
  }

  /* -------- 投稿処理 (回転・明るさ反映) -------- */

  async function handlePost() {
    if (!crop || !imgRef.current || !containerRef.current) return

    const img = imgRef.current
    const scale = img.naturalWidth / img.clientWidth

    const canvas = document.createElement('canvas')
    canvas.width = crop.w * scale
    canvas.height = crop.h * scale
    const ctx = canvas.getContext('2d')!

    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.filter = `brightness(${brightness})`

    const imgCenterX = img.offsetLeft + img.clientWidth / 2
    const imgCenterY = img.offsetTop + img.clientHeight / 2
    const cropCenterX = crop.x + crop.w / 2
    const cropCenterY = crop.y + crop.h / 2

    const dx = (imgCenterX - cropCenterX) * scale
    const dy = (imgCenterY - cropCenterY) * scale

    ctx.drawImage(
      img,
      dx - img.naturalWidth / 2,
      dy - img.naturalHeight / 2,
      img.naturalWidth,
      img.naturalHeight
    )

    const blob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.9)
    )

    onPost(new File([blob], file.name, { type: 'image/jpeg' }))
  }

  return (
    <div style={styles.overlay} onClick={onCancel}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-spin-custom { animation: spin 1s linear infinite; }
      `}</style>

      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <button onClick={onCancel} style={styles.closeBtn}>×</button>
          <div style={{ display: 'flex', gap: 20 }}>
            <button onClick={() => setRotation((r) => (r + 90) % 360)} style={styles.actionBtn}>
              <RotateCw size={24} />
            </button>
            <button onClick={handlePost} disabled={uploading} style={styles.actionBtn}>
              {uploading ? (
                <Loader2 size={24} className="animate-spin-custom" />
              ) : (
                <SendHorizontal size={24} />
              )}
            </button>
          </div>
        </div>

        {/* 明るさコントロールUI */}
        <div style={styles.controls}>
          <div style={styles.controlLabel}>
            <Sun size={18} />
            <span style={{ fontSize: 14 }}>明るさ</span>
          </div>
          <input
            type="range"
            min={0.5}
            max={1.5}
            step={0.01}
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
            style={styles.slider}
          />
          <div style={styles.valueDisplay}>
            {Math.round(brightness * 100)}%
          </div>
        </div>

        <div ref={containerRef} style={styles.body}>
          <img
            ref={imgRef}
            src={imageUrl}
            alt="editor"
            style={{
              maxWidth: '90%',
              maxHeight: '80%',
              transform: `rotate(${rotation}deg)`,
              filter: `brightness(${brightness})`,
              userSelect: 'none',
              pointerEvents: 'none', 
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
              {(['top', 'right', 'bottom', 'left', 'top-left', 'top-right', 'bottom-left', 'bottom-right'] as Handle[]).map((h) => (
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
  controls: {
    padding: '12px 20px',
    background: 'rgba(255,255,255,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  controlLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    minWidth: '70px',
  },
  slider: {
    flex: 1,
    cursor: 'pointer',
    accentColor: '#00aaff',
  },
  valueDisplay: {
    minWidth: '40px',
    textAlign: 'right',
    fontSize: '14px',
    fontVariantNumeric: 'tabular-nums',
  },
}

const handlePos: Record<Handle, CSSProperties> = {
  top: { left: '50%', top: 0, transform: 'translate(-50%, -50%)' },
  right: { left: '100%', top: '50%', transform: 'translate(-50%, -50%)' },
  bottom: { left: '50%', top: '100%', transform: 'translate(-50%, -50%)' },
  left: { left: 0, top: '50%', transform: 'translate(-50%, -50%)' },
  'top-left': { left: 0, top: 0, transform: 'translate(-50%, -50%)' },
  'top-right': { left: '100%', top: 0, transform: 'translate(-50%, -50%)' },
  'bottom-left': { left: 0, top: '100%', transform: 'translate(-50%, -50%)' },
  'bottom-right': { left: '100%', top: '100%', transform: 'translate(-50%, -50%)' },
}