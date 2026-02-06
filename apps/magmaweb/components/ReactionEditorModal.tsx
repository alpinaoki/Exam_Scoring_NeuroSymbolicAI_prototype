'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Star, AlertTriangle, HelpCircle, X, Send } from 'lucide-react'
import { createReaction } from '../lib/reactions'

type ReactionType = 'star' | 'exclamation' | 'question'

interface Props {
  open: boolean
  imageUrl: string
  postId: string
  username: string   // ← 追加
  onClose: () => void
}

export default function ReactionEditorModal({
  open,
  imageUrl,
  postId,
  username,          // ← 追加
  onClose,
}: Props) {
  const [mounted, setMounted] = useState(false)
  const [type, setType] = useState<ReactionType>('star')
  const [comment, setComment] = useState('')
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const [saving, setSaving] = useState(false)

  const imgRef = useRef<HTMLImageElement>(null)

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
      const finalComment =
        type === 'question'
          ? JSON.stringify([
              {
                username,       // ← 投稿者名をそのまま入れる
                content: comment,
              },
            ])
          : comment

      await createReaction({
        postId,
        type,
        comment: finalComment,
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
          <span style={styles.headerTitle}>ポイントをタップして位置を指定</span>
          <button
            onClick={submit}
            disabled={!pos || saving}
            style={{
              ...styles.submitHeader,
              opacity: !pos || saving ? 0.4 : 1,
              color: pos ? '4D96FF_1' : '#666',
            }}
          >
            {saving ? '保存中...' : <Send size={22} />}
          </button>
        </div>

        {/* Image Canvas */}
        <div style={styles.canvas}>
          <div style={styles.imageWrapper}>
            <img
              ref={imgRef}
              src={imageUrl}
              style={styles.image}
              alt="Target"
              onClick={(e) => {
                if (!imgRef.current) return
                const rect = imgRef.current.getBoundingClientRect()

                setPos({
                  x: (e.clientX - rect.left) / rect.width,
                  y: (e.clientY - rect.top) / rect.height,
                })
              }}
            />

            {!pos && (
              <div style={styles.tapHint}>
                画像をタップして位置を指定
              </div>
            )}

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
        </div>

        {/* Controls Area */}
        <div style={styles.controls}>
          <div style={styles.typeRow}>
            {(['star', 'exclamation', 'question'] as const).map((t) => (
              <TypeButton
                key={t}
                active={type === t}
                onClick={() => setType(t)}
                type={t}
              >
                {t === 'star' && (
                  <Star size={20} fill={type === t ? 'FFD700_1' : 'transparent'} />
                )}
                {t === 'exclamation' && (
                  <AlertTriangle
                    size={20}
                    fill={type === t ? 'FF6B6B_1' : 'transparent'}
                  />
                )}
                {t === 'question' && (
                  <HelpCircle
                    size={20}
                    fill={type === t ? '4D96FF_1' : 'transparent'}
                  />
                )}
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
  star: <Star size={28} fill="FFD700_1" stroke="#000" strokeWidth={1.5} />,
  exclamation: (
    <AlertTriangle size={28} fill="FF6B6B_1" stroke="#000" strokeWidth={1.5} />
  ),
  question: (
    <HelpCircle size={28} fill="4D96FF_1" stroke="#000" strokeWidth={1.5} />
  ),
}

const typeLabels = {
  star: 'いいね！',
  exclamation: '指摘',
  question: '疑問・確認',
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
    fontWeight: 700,
    fontSize: '16px',
    cursor: 'pointer',
    padding: '8px',
  },
  canvas: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageWrapper: {
    position: 'relative',
    maxWidth: '100%',
    maxHeight: '100%',
  },
  image: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
    display: 'block',
  },
  tapHint: {
    position: 'absolute',
    bottom: 16,
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: 12,
    color: '#ccc',
    opacity: 0.8,
  },
  marker: {
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    zIndex: 10,
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
  },
}
