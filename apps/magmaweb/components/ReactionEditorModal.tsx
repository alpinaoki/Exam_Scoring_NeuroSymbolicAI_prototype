'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Star, AlertCircle, HelpCircle, X } from 'lucide-react'
import { createReaction } from '@/lib/reactions'

type ReactionType = 'star' | 'exclamation' | 'question'

interface Props {
  open: boolean
  imageUrl: string
  postId: string
  onClose: () => void
}

export default function ReactionEditorModal({
  open,
  imageUrl,
  postId,
  onClose,
}: Props) {
  const [mounted, setMounted] = useState(false)
  const [type, setType] = useState<ReactionType>('star')
  const [comment, setComment] = useState('')
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const [saving, setSaving] = useState(false)

  // body lock（ImageEditorModal互換）
  useEffect(() => {
    if (!open) return
    const o = document.body.style.overflow
    const t = document.body.style.touchAction
    document.body.style.overflow = 'hidden'
    document.body.style.touchAction = 'none'
    return () => {
      document.body.style.overflow = o
      document.body.style.touchAction = t
    }
  }, [open])

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!open || !mounted) return null

  const submit = async () => {
    if (!pos || saving) return
    setSaving(true)

    try {
      await createReaction({
        postId,
        type,
        comment,
        x: pos.x,
        y: pos.y,
      })
      onClose()
    } catch (e) {
      console.error(e)
      alert('リアクションの保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  return createPortal(
    <div style={styles.overlay}>
      <div style={styles.container}>
        {/* header */}
        <div style={styles.header}>
          <span>リアクションを追加</span>
          <button onClick={onClose} style={styles.close}>
            <X size={20} />
          </button>
        </div>

        {/* type selector（ハート削除済） */}
        <div style={styles.typeRow}>
          <TypeButton active={type === 'star'} onClick={() => setType('star')}>
            <Star />
          </TypeButton>
          <TypeButton active={type === 'exclamation'} onClick={() => setType('exclamation')}>
            <AlertCircle />
          </TypeButton>
          <TypeButton active={type === 'question'} onClick={() => setType('question')}>
            <HelpCircle />
          </TypeButton>
        </div>

        {/* comment（iOSズーム完全回避） */}
        <input
          placeholder="コメントを入力"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          style={styles.input}
        />

        {/* image canvas */}
        <div
          style={styles.canvas}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            setPos({
              x: (e.clientX - rect.left) / rect.width,
              y: (e.clientY - rect.top) / rect.height,
            })
          }}
        >
          <img src={imageUrl} style={styles.image} />

          {pos && (
            <div
              style={{
                ...styles.marker,
                left: `${pos.x * 100}%`,
                top: `${pos.y * 100}%`,
              }}
            >
              {iconMap[type]}
            </div>
          )}
        </div>

        <button
          style={styles.submit}
          disabled={!pos || saving}
          onClick={submit}
        >
          決定
        </button>
      </div>
    </div>,
    document.body
  )
}

function TypeButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode
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
      {children}
    </button>
  )
}

const iconMap = {
  star: <Star size={22} fill="#FFD700" stroke="#000" />,
  exclamation: <AlertCircle size={22} fill="#FF6B6B" stroke="#000" />,
  question: <HelpCircle size={22} fill="#4D96FF" stroke="#000" />,
}

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 999999,
    background: 'rgba(0,0,0,0.6)',
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
    fontWeight: 600,
  },
  close: {
    background: 'none',
    border: 'none',
  },
  typeRow: {
    display: 'flex',
    gap: 8,
    padding: 12,
  },
  typeButton: {
    border: '1px solid #000',
    borderRadius: 8,
    padding: 8,
  },
  input: {
    margin: '0 12px 12px',
    padding: '10px 12px',
    fontSize: 16,
    border: '1px solid #ccc',
    borderRadius: 6,
  },
  canvas: {
    flex: 1,
    position: 'relative',
    background: '#000',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    pointerEvents: 'none',
  },
  marker: {
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
  },
  submit: {
    margin: 12,
    padding: 12,
    borderRadius: 8,
    background: '#111',
    color: '#fff',
    fontWeight: 600,
  },
}
