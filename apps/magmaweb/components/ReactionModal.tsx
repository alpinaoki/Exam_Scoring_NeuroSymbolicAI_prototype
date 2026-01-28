'use client'

import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { Star, AlertTriangle, HelpCircle, SendHorizontal, X } from 'lucide-react'
import { supabase } from '../lib/supabase'

type ReactionType = 'star' | 'exclamation' | 'question'

type Props = {
  open: boolean
  imageUrl: string
  postId: string
  onClose: () => void
}

export default function ReactionModal({ open, imageUrl, postId, onClose }: Props) {
  const [pos, setPos] = useState({ x: 0.5, y: 0.5 })
  const [type, setType] = useState<ReactionType>('star')
  const [comment, setComment] = useState('')
  const [dragging, setDragging] = useState(false)

  if (!open) return null

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setDragging(true)
    movePin(e)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return
    movePin(e)
  }

  const handlePointerUp = () => {
    setDragging(false)
  }

  const movePin = (e: React.PointerEvent) => {
    const img = document.getElementById('reaction-image')
    if (!img) return
    const rect = img.getBoundingClientRect()

    setPos({
      x: Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height)),
    })
  }

  const submit = async () => {
    if (!comment.trim()) return
    const { data } = await supabase.auth.getUser()

    await supabase.from('reactions').insert({
      post_id: postId,
      user_id: data.user?.id,
      type,
      comment,
      x_float: pos.x,
      y_float: pos.y,
    })

    onClose()
    window.location.reload()
  }

  const icon = (size = 26) => {
    if (type === 'star') return <Star size={size} fill="#FFD700" />
    if (type === 'exclamation') return <AlertTriangle size={size} fill="#FF4500" />
    return <HelpCircle size={size} fill="#00BFFF" />
  }

  return (
    <div style={styles.backdrop}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <span style={styles.title}>リアクションを置く</span>
          <X size={18} onClick={onClose} style={{ cursor: 'pointer' }} />
        </div>

        <div
          style={styles.imageWrapper}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <img
            id="reaction-image"
            src={imageUrl}
            alt="answer"
            style={styles.image}
            draggable={false}
          />

          <div
            style={{
              ...styles.pin,
              left: `${pos.x * 100}%`,
              top: `${pos.y * 100}%`,
            }}
          >
            {icon()}
          </div>
        </div>

        <div style={styles.typeRow}>
          {(['star', 'exclamation', 'question'] as const).map(t => (
            <button
              key={t}
              onClick={() => setType(t)}
              style={{
                ...styles.typeBtn,
                borderColor: type === t ? '#ff8c00' : '#eee',
              }}
            >
              {t === 'star' && <Star />}
              {t === 'exclamation' && <AlertTriangle />}
              {t === 'question' && <HelpCircle />}
            </button>
          ))}
        </div>

        <div style={styles.inputRow}>
          <input
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="一言コメント"
            style={styles.input}
          />
          <button onClick={submit} style={styles.sendBtn}>
            <SendHorizontal size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

const styles: { [key: string]: CSSProperties } = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.55)',
    zIndex: 5000,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '90%',
    maxWidth: 420,
    background: '#fff',
    borderRadius: 16,
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontWeight: 700 },
  imageWrapper: {
    position: 'relative',
    touchAction: 'none',
  },
  image: {
    width: '100%',
    borderRadius: 12,
    userSelect: 'none',
  },
  pin: {
    position: 'absolute',
    transform: 'translate(-50%, -50%) scale(1.4)',
    filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.4))',
    pointerEvents: 'none',
  },
  typeRow: {
    display: 'flex',
    gap: 6,
  },
  typeBtn: {
    flex: 1,
    padding: 8,
    borderRadius: 10,
    border: '1px solid',
    background: '#fff',
    cursor: 'pointer',
  },
  inputRow: {
    display: 'flex',
    gap: 6,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    border: '1px solid #ddd',
  },
  sendBtn: {
    background: '#333',
    color: '#fff',
    borderRadius: 10,
    padding: 8,
    border: 'none',
    cursor: 'pointer',
  },
}
