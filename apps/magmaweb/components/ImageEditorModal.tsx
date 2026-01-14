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
      // 2. 四隅のドラッグに対応するように計算を拡張
      let { x: nx, y: ny, w: nw, h: nh } = c

      if (activeHandle.includes('top')) {
        ny = y
        nh = c.y + c.h - y
      }
      if (activeHandle.includes('bottom')) {
        nh = y - c.y
      }
      if (activeHandle.includes('left')) {
        nx = x
        nw = c.x + c.w - x
      }
      if (activeHandle.includes('right')) {
        nw = x - c.x
      }

      return {
        x: nx,
        y: ny,
        w: Math.max(20, nw),
        h: Math.max(20, nh),
      }
    })
  }

  const stopDrag = (e: React.PointerEvent) => {
    if (activeHandle) {
      ;(e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId)
      setActiveHandle(null)
    }
  }

  /* -------- 投稿処理 (修正版) -------- */

  async function handlePost() {
    if (!crop || !imgRef.current || !containerRef.current) return

    const img = imgRef.current
    
    // 1. 重要：回転に左右されない「元のサイズ」との倍率を計算
    // clientWidth/Height は CSS transform (rotate) の影響を受けない元の数値を返します
    const scale = img.naturalWidth / img.clientWidth

    // 2. 出力用キャンバスの作成（トリミング枠のサイズ）
    const canvas = document.createElement('canvas')
    canvas.width = crop.w * scale
    canvas.height = crop.h * scale
    const ctx = canvas.getContext('2d')!

    // 3. キャンバスの中心に座標系を移動して回転させる
ctx.translate(canvas.width / 2, canvas.height / 2)
ctx.rotate((rotation * Math.PI) / 180)

// ★ 明るさ反映
ctx.filter = `brightness(${brightness})`

    // 4. UI上の「画像中心」と「トリミング枠中心」の距離を出す
    // offsetTop/Left は親要素(body)内での元の位置（回転前）を指すので正確です
    const imgCenterX = img.offsetLeft + img.clientWidth / 2
    const imgCenterY = img.offsetTop + img.clientHeight / 2
    const cropCenterX = crop.x + crop.w / 2
    const cropCenterY = crop.y + crop.h / 2

    const dx = (imgCenterX - cropCenterX) * scale
    const dy = (imgCenterY - cropCenterY) * scale

    // 5. 画像を描画
    // 画像自身の中心が (dx, dy) に来るように配置
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
      {/* 1. アニメーション用のスタイルを追加 */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-spin-custom {
          animation: spin 1s linear infinite;
        }
      `}</style>

      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <button onClick={onCancel} style={styles.closeBtn}>×</button>
          <div style={{ display: 'flex', gap: 20 }}>
            <button onClick={() => setRotation((r) => (r + 90) % 360)} style={styles.actionBtn}>
              <RotateCw size={24} />
            </button>
            <button onClick={handlePost} disabled={uploading} style={styles.actionBtn}>
              {/* 2. classNameを独自のものに変え、sizeを明示 */}
              {uploading ? (
                <Loader2 size={24} className="animate-spin-custom" />
              ) : (
                <SendHorizontal size={24} />
              )}
            </button>
          </div>
        </div>

<div style={styles.controls}>
  <input
    type="range"
    min={0.5}
    max={1.5}
    step={0.01}
    value={brightness}
    onChange={(e) => setBrightness(Number(e.target.value))}
    style={{ width: '100%' }}
  />
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
              {/* 3. マップする配列に四隅を追加 */}
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
  padding: '8px 16px',
  background: 'rgba(0,0,0,0.4)',
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