'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { HelpCircle, TouchpadOff } from 'lucide-react'

type ReactionType = 'star' | 'exclamation' | 'question'

interface Props {
  open: boolean
  imageUrl: string
  postId: string
  username: string
  onClose: (data?: { type: ReactionType; comment: string; x: number; y: number }) => void
}

export default function ReactionEditorModal({
  open,
  imageUrl,
  username,
  onClose,
}: Props) {
  const [mounted, setMounted] = useState(false)
  const type: ReactionType = 'question'
  const [comment, setComment] = useState('')
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const [imgSize, setImgSize] = useState<{ width: number; height: number } | null>(null)

  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    document.body.style.touchAction = 'none'
    return () => {
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
    }
  }, [open])

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget
    setImgSize({ width: naturalWidth, height: naturalHeight })
  }

  if (!open || !mounted) return null

  const handleSubmit = () => {
    if (!pos) return
    const finalComment = JSON.stringify([{ username, content: comment }])
    onClose({ type, comment: finalComment, x: pos.x, y: pos.y })
  }

  const COLORS = { question: '#4D96FF' }

  return createPortal(
    <div style={styles.overlay}>
      <div style={styles.container}>
        {/* 【修正】LayoutShellのヘッダー（進捗バー）が見えるように、
            モーダル内の独自ヘッダーを削除しました。
         */}

        {/* Canvas Area */}
        <div style={styles.canvas}>
          <div 
            style={{
              ...styles.imageContainer,
              aspectRatio: imgSize ? `${imgSize.width} / ${imgSize.height}` : 'auto',
            }}
          >
            <img
              ref={imgRef}
              src={imageUrl}
              onLoad={handleImageLoad}
              style={styles.image}
              alt="Target"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const x = (e.clientX - rect.left) / rect.width
                const y = (e.clientY - rect.top) / rect.height
                setPos({ x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) })
              }}
              draggable={false}
            />

            {!pos && (
              <div style={styles.tapHintOverlay}>
                <div style={styles.tapHintBadge}>
                  <TouchpadOff size={18} />
                  <span>画像をタップして位置を指定</span>
                </div>
              </div>
            )}

            {pos && (
              <div style={styles.markerOverlay}>
                <div
                  style={{
                    ...styles.marker,
                    left: `${pos.x * 100}%`,
                    top: `${pos.y * 100}%`,
                  }}
                >
                  <HelpCircle size={32} fill={COLORS.question} stroke="#000" strokeWidth={1.5} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Controls Area */}
        <div style={styles.controls}>
          <div style={styles.inputWrapper}>
            <div style={styles.labelRow}>
              <HelpCircle size={18} color={COLORS.question} />
              <span style={styles.labelText}>質問内容</span>
            </div>
            <textarea
              placeholder="「ここがなぜこうなるのか」など"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={styles.textarea}
              rows={3}
            />
            <button
              onClick={handleSubmit}
              disabled={!pos}
              style={{
                ...styles.finalSubmitBtn,
                opacity: !pos ? 0.5 : 1,
              }}
            >
              質問を送信
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  // z-index を 3000(Shell Overlay) より少し低くするか調整
  // ここでは inset: 0 ですが背景を透過させないため Shell の上に重なります。
  overlay: { position: 'fixed', inset: 0, zIndex: 3050, background: '#000' }, 
  container: { width: '100vw', height: '100dvh', display: 'flex', flexDirection: 'column', color: '#fff', overflow: 'hidden', paddingTop: '60px' }, // 進捗バーを避けるための余白
  canvas: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', padding: '20px', overflow: 'hidden' },
  imageContainer: { position: 'relative', maxWidth: '100%', maxHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: '100%', objectFit: 'contain', display: 'block', userSelect: 'none' },
  markerOverlay: { position: 'absolute', inset: 0, pointerEvents: 'none' },
  marker: { position: 'absolute', transform: 'translate(-50%, -50%)', zIndex: 10 },
  tapHintOverlay: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' },
  tapHintBadge: { display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', padding: '12px 20px', borderRadius: '100px', fontSize: '14px', color: '#fff' },
  controls: { flexShrink: 0, padding: '20px 16px calc(24px + env(safe-area-inset-bottom))', background: '#111', borderTop: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px 24px 0 0' },
  inputWrapper: { maxWidth: '500px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '12px' },
  labelRow: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' },
  labelText: { fontSize: '14px', fontWeight: 'bold', color: '#4D96FF' },
  textarea: { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '14px', color: '#fff', fontSize: '16px', outline: 'none', resize: 'none' },
  finalSubmitBtn: { width: '100%', background: '#4D96FF', color: '#fff', border: 'none', borderRadius: '12px', padding: '16px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' },
}