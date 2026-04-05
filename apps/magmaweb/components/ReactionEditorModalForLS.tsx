'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Star, AlertTriangle, HelpCircle, X, Send, TouchpadOff } from 'lucide-react'

type ReactionType = 'star' | 'exclamation' | 'question'

// 型定義を修正：onClose が引数 (data) を受け取れるようにする
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
  const [type, setType] = useState<ReactionType>('star')
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

  // submit 関数を修正：DB保存はせず、データを親(LayoutShell)に渡すだけにする
  const handleSubmit = () => {
    if (!pos) return
    
    const finalComment = type === 'question'
      ? JSON.stringify([{ username, content: comment }])
      : comment

    // データを親に渡して閉じる
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
        {/* Header */}
        <div style={styles.header}>
          <button onClick={() => onClose()} style={styles.iconBtn}><X size={24} /></button>
          <span style={styles.headerTitle}>位置を指定してリアクション</span>
          <button
            onClick={handleSubmit}
            disabled={!pos}
            style={{
              ...styles.submitHeader,
              opacity: !pos ? 0.4 : 1,
              color: pos ? COLORS.question : '#666',
            }}
          >
            <Send size={22} />
          </button>
        </div>

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
              <TypeButton key={t} active={type === t} onClick={() => setType(t)} type={t}>
                {t === 'star' && <Star size={20} fill={type === t ? COLORS.star : 'transparent'} stroke={type === t ? '#000' : '#888'} />}
                {t === 'exclamation' && <AlertTriangle size={20} fill={type === t ? COLORS.exclamation : 'transparent'} stroke={type === t ? '#000' : '#888'} />}
                {t === 'question' && <HelpCircle size={20} fill={type === t ? COLORS.question : 'transparent'} stroke={type === t ? '#000' : '#888'} />}
                <span style={styles.typeLabel}>{typeLabels[t]}</span>
              </TypeButton>
            ))}
          </div>
          <div style={styles.inputWrapper}>
            <input
              placeholder="具体的に説明..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={styles.input}
            />
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

function TypeButton({ children, active, onClick, type }: any) {
  const activeColors = {
    star: 'rgba(255, 215, 0, 0.2)',
    exclamation: 'rgba(255, 107, 107, 0.2)',
    question: 'rgba(77, 150, 255, 0.2)',
  }
  return (
    <button
      onClick={onClick}
      style={{
        ...styles.typeButton,
        background: active ? activeColors[type as ReactionType] : 'rgba(255,255,255,0.05)',
        borderColor: active ? 'transparent' : 'rgba(255,255,255,0.1)',
        color: active ? '#fff' : '#888',
      }}
    >
      {children}
    </button>
  )
}

const typeLabels = { star: 'いいね！', exclamation: '指摘', question: '疑問・確認' }

const styles: { [key: string]: React.CSSProperties } = {
  overlay: { position: 'fixed', inset: 0, zIndex: 999999, background: '#000' },
  container: { width: '100vw', height: '100dvh', display: 'flex', flexDirection: 'column', color: '#fff', overflow: 'hidden' },
  header: { flexShrink: 0, padding: '0 16px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#000', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  headerTitle: { fontSize: '14px', fontWeight: 500, color: '#ccc' },
  iconBtn: { background: 'none', border: 'none', color: '#fff', padding: '8px', cursor: 'pointer' },
  submitHeader: { background: 'none', border: 'none', fontWeight: 700, fontSize: '16px', cursor: 'pointer', padding: '8px' },
  canvas: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0a0a0a',
    padding: '20px',
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    maxWidth: '100%',
    maxHeight: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
    display: 'block',
    userSelect: 'none',
    WebkitUserSelect: 'none',
  },
  markerOverlay: { position: 'absolute', inset: 0, pointerEvents: 'none' },
  marker: { position: 'absolute', transform: 'translate(-50%, -50%)', zIndex: 10 },
  tapHintOverlay: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' },
  tapHintBadge: { display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', padding: '12px 20px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.2)', fontSize: '14px', color: '#fff' },
  controls: { flexShrink: 0, padding: '20px 16px calc(20px + env(safe-area-inset-bottom))', background: '#000', borderTop: '1px solid rgba(255,255,255,0.1)' },
  typeRow: { display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '20px' },
  typeButton: { flex: 1, maxWidth: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '12px 8px', borderRadius: '12px', border: '1px solid', fontSize: '12px', transition: 'all 0.2s ease', cursor: 'pointer' },
  typeLabel: { fontWeight: 500 },
  inputWrapper: { maxWidth: '500px', margin: '0 auto' },
  input: { width: '100%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '14px 18px', color: '#fff', fontSize: '16px', outline: 'none' },
}