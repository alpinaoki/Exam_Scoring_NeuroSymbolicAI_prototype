'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Star, Heart, AlertCircle, HelpCircle, X } from 'lucide-react'

type ReactionType = 'star' | 'heart' | 'exclamation' | 'question'

interface Props {
  open: boolean
  onClose: () => void
}

export default function ReactionEditorModal({ open, onClose }: Props) {
  const [mounted, setMounted] = useState(false)
  const [type, setType] = useState<ReactionType>('star')
  const [comment, setComment] = useState('')
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)

  // body完全ロック
  useEffect(() => {
    if (!open) return

    const originalOverflow = document.body.style.overflow
    const originalTouchAction = document.body.style.touchAction

    document.body.style.overflow = 'hidden'
    document.body.style.touchAction = 'none'

    return () => {
      document.body.style.overflow = originalOverflow
      document.body.style.touchAction = originalTouchAction
    }
  }, [open])

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!open || !mounted) return null

  return createPortal(
    <div style={styles.overlay}>
      <div style={styles.container}>
        <div style={styles.header}>
          <span>リアクションを追加</span>
          <button onClick={onClose} style={styles.close}>
            <X size={20} />
          </button>
        </div>

        <div style={styles.typeRow}>
          <TypeButton icon={<Star />} active={type === 'star'} onClick={() => setType('star')} />
          <TypeButton icon={<Heart />} active={type === 'heart'} onClick={() => setType('heart')} />
          <TypeButton icon={<AlertCircle />} active={type === 'exclamation'} onClick={() => setType('exclamation')} />
          <TypeButton icon={<HelpCircle />} active={type === 'question'} onClick={() => setType('question')} />
        </div>

        <input
          placeholder="コメントを入力"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          style={styles.input}
        />

        <div
          style={styles.canvas}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            setPos({
              x: e.clientX - rect.left,
              y: e.clientY - rect.top,
            })
          }}
        >
          {pos && (
            <div
              style={{
                ...styles.marker,
                left: pos.x,
                top: pos.y,
              }}
            >
              {iconMap[type]}
            </div>
          )}
        </div>

        <button style={styles.submit} disabled={!pos}>
          決定
        </button>
      </div>
    </div>,
    document.body
  )
}

function TypeButton({
  icon,
  active,
  onClick,
}: {
  icon: React.ReactNode
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        ...styles.typeButton,
        background: active ? '#eee' : '#fff',
      }}
    >
      {icon}
    </button>
  )
}

const iconMap = {
  star: <Star size={20} />,
  heart: <Heart size={20} />,
  exclamation: <AlertCircle size={20} />,
  question: <HelpCircle size={20} />,
}

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 999999,
    background: 'rgba(0,0,0,0.6)',
    overscrollBehavior: 'none',
  },
  container: {
    width: '100vw',
    height: '100vh',
    background: '#fff',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    padding: '12px 16px',
    borderBottom: '1px solid #ddd',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontWeight: 600,
  },
  close: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  typeRow: {
    display: 'flex',
    gap: 8,
    padding: 12,
  },
  typeButton: {
    border: '1px solid #ccc',
    borderRadius: 8,
    padding: 8,
    cursor: 'pointer',
  },
  input: {
    margin: '0 12px 12px',
    padding: 8,
    borderRadius: 6,
    border: '1px solid #ccc',
  },
  canvas: {
    flex: 1,
    position: 'relative',
    background: '#f7f7f7',
  },
  marker: {
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
  },
  submit: {
    margin: 12,
    padding: 12,
    borderRadius: 8,
    border: 'none',
    background: '#111',
    color: '#fff',
    fontWeight: 600,
  },
}
