'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Star, AlertTriangle, HelpCircle, TouchpadOff } from 'lucide-react'

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
  const [type, setType] = useState<ReactionType>('question') // デフォルトを質問に
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

  const handleConfirm = () => {
    if (!pos) return
    const finalComment = type === 'question'
      ? JSON.stringify([{ username, content: comment }])
      : comment

    onClose({
      type,
      comment: finalComment,
      x: pos.x,
      y: pos.y,
    })
  }

  const COLORS = {
    star: '#FFD700',
    exclamation: '#FF6B6B',
    question: '#4D96FF',
  }

  const iconMap = {
    star: <Star size={24} fill={COLORS.star} stroke="#000" strokeWidth={1.5} />,
    exclamation: <AlertTriangle size={24} fill={COLORS.exclamation} stroke="#000" strokeWidth={1.5} />,
    question: <HelpCircle size={24} fill={COLORS.question} stroke="#000" strokeWidth={1.5} />,
  }

  return createPortal(
    <div style={styles.overlay}>
      <div style={styles.container}>
        {/* HeaderはLayoutShell側に任せるため削除 */}

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
                  {iconMap[type]}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Controls Area */}
        <div style={styles.controls}>
          <div style={styles.typeRow}>
            {(['star', 'exclamation', 'question'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                style={{
                  ...styles.typeButton,
                  background: type === t ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
                  borderColor: type === t ? COLORS[t] : 'transparent',
                }}
              >
                {t === 'star' && <Star size={20} fill={type === t ? COLORS.star : 'transparent'} stroke={type === t ? '#000' : '#888'} />}
                {t === 'exclamation' && <AlertTriangle size={20} fill={type === t ? COLORS.exclamation : 'transparent'} stroke={type === t ? '#000' : '#888'} />}
                {t === 'question' && <HelpCircle size={20} fill={type === t ? COLORS.question : 'transparent'} stroke={type === t ? '#000' : '#888'} />}
              </button>
            ))}
          </div>
          <div style={styles.inputWrapper}>
            <input
              placeholder="具体的に説明..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={styles.input}
            />
            <button
              onClick={handleConfirm}
              disabled={!pos}
              style={{
                ...styles.finalSubmitBtn,
                opacity: !pos ? 0.5 : 1,
                background: COLORS[type]
              }}
            >
              投稿を完了する
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  // zIndexをLayoutShellのprogressContainer(4000)より低く設定
  overlay: { position: 'fixed', inset: 0, zIndex: 3050, background: 'transparent' },
  container: { 
    width: '100vw', 
    height: '100dvh', 
    display: 'flex', 
    flexDirection: 'column', 
    color: '#fff', 
    overflow: 'hidden',
    background: '#000',
    paddingTop: '60px' // 進捗バー(約50px〜)が被らないように余白を空ける
  },
  canvas: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', padding: '20px', overflow: 'hidden' },
  imageContainer: { position: 'relative', maxWidth: '100%', maxHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: '100%', objectFit: 'contain', display: 'block', userSelect: 'none' },
  markerOverlay: { position: 'absolute', inset: 0, pointerEvents: 'none' },
  marker: { position: 'absolute', transform: 'translate(-50%, -50%)', zIndex: 10 },
  tapHintOverlay: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' },
  tapHintBadge: { display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', padding: '12px 20px', borderRadius: '100px', fontSize: '14px', color: '#fff' },
  controls: { flexShrink: 0, padding: '20px 16px calc(20px + env(safe-area-inset-bottom))', background: '#000', borderTop: '1px solid rgba(255,255,255,0.1)' },
  typeRow: { display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '20px' },
  typeButton: { width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', border: '2px solid', cursor: 'pointer', transition: 'all 0.2s' },
  inputWrapper: { maxWidth: '500px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '12px' },
  input: { width: '100%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '14px 18px', color: '#fff', fontSize: '16px', outline: 'none' },
  finalSubmitBtn: { width: '100%', color: '#000', border: 'none', borderRadius: '14px', padding: '16px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }
}