'use client'

import { useState, useEffect } from 'react'
import type { CSSProperties } from 'react'
import {
  Star,
  AlertTriangle,
  HelpCircle,
  SendHorizontal,
  X,
} from 'lucide-react'
import { supabase } from '../lib/supabase'

type ReactionType = 'star' | 'exclamation' | 'question'

type Props = {
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
  const [pos, setPos] = useState({ x: 0.5, y: 0.5 })
  const [type, setType] = useState<ReactionType>('star')
  const [comment, setComment] = useState('')
  const [dragging, setDragging] = useState(false)

  // bodyスクロールを止める（ImageEditorModalと同じ）
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  // ドラッグ処理
  useEffect(() => {
    if (!dragging) return

    const handleMove = (e: PointerEvent) => {
      const img = document.getElementById('reaction-editor-img')
      if (!img) return
      const r = img.getBoundingClientRect()
      setPos({
        x: Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)),
        y: Math.max(0, Math.min(1, (e.clientY - r.top) / r.height)),
      })
    }

    const handleUp = () => setDragging(false)

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }
  }, [dragging])

  if (!open) return null

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
    location.reload()
  }

  const icon = (size = 28) => {
    if (type === 'star')
      return <Star size={size} fill="#FFD700" color="#FFD700" />
    if (type === 'exclamation')
      return <AlertTriangle size={size} fill="#FF4500" color="#FF4500" />
    return <HelpCircle size={size} fill="#00BFFF" color="#00BFFF" />
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.header}>
        <button onClick={onClose} style={styles.close}>
          <X />
        </button>
        <button onClick={submit} style={styles.send}>
          <SendHorizontal />
        </button>
      </div>

      <div style={styles.body}>
        <div style={styles.imageWrapper}>
          <img
            id="reaction-editor-img"
            src={imageUrl}
            alt="reaction target"
            style={styles.image}
            draggable={false}
          />

          {/* ドラッグするリアクション */}
          <div
            style={{
              ...styles.marker,
              left: `${pos.x * 100}%`,
              top: `${pos.y * 100}%`,
            }}
            onPointerDown={() => setDragging(true)}
          >
            {icon(36)}
          </div>
        </div>

        {/* 下部UI */}
        <div style={styles.panel}>
          <div style={styles.typeRow}>
            <button onClick={() => setType('star')}>{icon()}</button>
            <button onClick={() => setType('exclamation')}>
              <AlertTriangle size={28} />
            </button>
            <button onClick={() => setType('question')}>
              <HelpCircle size={28} />
            </button>
          </div>

          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="コメントを書く"
            style={styles.input}
          />
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
    color: '#fff',
  },
  header: {
    height: 56,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 16px',
    background: 'rgba(255,255,255,0.05)',
  },
  close: {
    background: 'none',
    border: 'none',
    color: '#fff',
  },
  send: {
    background: 'none',
    border: 'none',
    color: '#fff',
  },
  body: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 56px)',
  },
  imageWrapper: {
    flex: 1,
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    maxWidth: '100%',
    maxHeight: '100%',
    userSelect: 'none',
    pointerEvents: 'none',
  },
  marker: {
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    cursor: 'grab',
  },
  panel: {
    padding: 16,
    background: 'rgba(255,255,255,0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  typeRow: {
    display: 'flex',
    justifyContent: 'space-around',
  },
  input: {
    padding: '10px 12px',
    borderRadius: 8,
    border: 'none',
    fontSize: 14,
  },
}
