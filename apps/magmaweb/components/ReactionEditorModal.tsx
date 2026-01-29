'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Star, AlertCircle, HelpCircle, X, Send } from 'lucide-react'
import { createReaction } from '../lib/reactions'

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
        {/* Header */}
        <div style={styles.header}>
          <button onClick={onClose} style={styles.iconBtn}>
            <X size={24} />
          </button>
          <span style={styles.headerTitle}>ポイントをタップして保存</span>
          <button 
            onClick={submit} 
            disabled={!pos || saving} 
            style={{ 
              ...styles.submitHeader, 
              opacity: !pos || saving ? 0.4 : 1 
            }}
          >
            {saving ? '保存中...' : <Send size={22} />}
          </button>
        </div>

        {/* Image Canvas */}
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
          <img src={imageUrl} style={styles.image} alt="Target" />
          {pos && (
            <div
              style={{
                ...styles.marker,
                left: `${pos.x * 100}%`,
                top: `${pos.y * 100}%`,
              }}
            >
              <div style={styles.markerPing} />
              {iconMap[type]}
            </div>
          )}
        </div>

        {/* Controls Area */}
        <div style={styles.controls}>
          {/* Type Selector */}
          <div style={styles.typeRow}>
            {(['star', 'exclamation', 'question'] as const).map((t) => (
              <TypeButton 
                key={t} 
                active={type === t} 
                onClick={() => setType(t)}
                type={t}
              >
                {t === 'star' && <Star size={20} fill={type === t ? "#FFD700" : "transparent"} />}
                {t === 'exclamation' && <AlertCircle size={20} fill={type === t ? "#FF6B6B" : "transparent"} />}
                {t === 'question' && <HelpCircle size={20} fill={type === t ? "#4D96FF" : "transparent"} />}
                <span style={styles.typeLabel}>{typeLabels[t]}</span>
              </TypeButton>
            ))}
          </div>

          {/* Input Area */}
          <div style={styles.inputWrapper}>
            <input
              placeholder="一言コメントを添える..."
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

function TypeButton({
  children,
  active,
  onClick,
  type,
}: {
  children: React.ReactNode
  active: boolean
  onClick: () => void
  type: ReactionType
}) {
  const activeColors = {
    star: 'rgba(255, 215, 0, 0.15)',
    exclamation: 'rgba(255, 107, 107, 0.15)',
    question: 'rgba(77, 150, 255, 0.15)',
  }

  return (
    <button
      onClick={onClick}
      style={{
        ...styles.typeButton,
        background: active ? activeColors[type] : 'rgba(255,255,255,0.05)',
        borderColor: active ? 'transparent' : 'rgba(255,255,255,0.1)',
        color: active ? '#fff' : '#888',
      }}
    >
      {children}
    </button>
  )
}

const iconMap = {
  star: <Star size={28} fill="#FFD700" stroke="#000" strokeWidth={1.5} />,
  exclamation: <AlertCircle size={28} fill="#FF6B6B" stroke="#000" strokeWidth={1.5} />,
  question: <HelpCircle size={28} fill="#4D96FF" stroke="#000" strokeWidth={1.5} />,
}

const typeLabels = {
  star: 'いいね',
  exclamation: '注目',
  question: '疑問',
}

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 999999,
    background: '#000',
  },
  container: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    color: '#fff',
  },
  header: {
    padding: '8px 16px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'rgba(0,0,0,0.8)',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  headerTitle: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#ccc',
  },
  iconBtn: {
    background: 'none',
    border: 'none',
    color: '#fff',
    padding: '8px',
    cursor: 'pointer',
  },
  submitHeader: {
    background: 'none',
    border: 'none',
    color: '#4D96FF',
    fontWeight: 700,
    fontSize: '16px',
    cursor: 'pointer',
    padding: '8px',
  },
  canvas: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    touchAction: 'none',
  },
  image: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
    pointerEvents: 'none',
  },
  marker: {
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    zIndex: 10,
    filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.5))',
  },
  markerPing: {
    position: 'absolute',
    inset: -4,
    borderRadius: '50%',
    border: '2px solid #fff',
    animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
  },
  controls: {
    padding: '20px 16px 40px',
    background: 'linear-gradient(to top, #000 80%, transparent)',
    borderTop: '1px solid rgba(255,255,255,0.05)',
  },
  typeRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '20px',
  },
  typeButton: {
    flex: 1,
    maxWidth: '100px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    padding: '12px 8px',
    borderRadius: '12px',
    border: '1px solid',
    fontSize: '12px',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  },
  typeLabel: {
    fontWeight: 500,
  },
  inputWrapper: {
    maxWidth: '500px',
    margin: '0 auto',
  },
  input: {
    width: '100%',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '14px',
    padding: '14px 18px',
    color: '#fff',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
}