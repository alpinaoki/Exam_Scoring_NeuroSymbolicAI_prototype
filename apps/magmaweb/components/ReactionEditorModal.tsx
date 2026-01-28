'use client'

import { useState } from 'react'
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

  if (!open) return null

  const movePin = (e: React.PointerEvent) => {
    const img = document.getElementById('reaction-editor-img')
    if (!img) return
    const r = img.getBoundingClientRect()

    setPos({
      x: Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)),
      y: Math.max(0, Math.min(1, (e.clientY - r.top) / r.height)),
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
    location.reload()
  }

  const icon = (size = 28) => {
    if (type === 'star') return <Star size={size} fill="#FFD700" />
    if (type === 'exclamation') return <AlertTriangle size={size} fill="#FF4500" />
    return <HelpCircle size={size} fill="#00BFFF" />
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.header}>
        <X size={26} onClick={onClose} />
        <button onClick={submit}><SendHorizontal size={24} /></button>
      </div>

      <div
        style={styles.body}
        onPointerDown={(e) => { setDragging(true); movePin(e) }}
        onPointerMove={(e) => dragging && movePin(e)}
        onPointerUp={() => setDragging(false)}
      >
        <img
          id="reaction-editor-img"
          src={imageUrl}
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

      <div style={styles.footer}>
        {(['star', 'exclamation', 'question'] as const).map(t => (
          <button
            key={t}
            onClick={() => setType(t)}
            style={{
              ...styles.typeBtn,
              opacity: type === t ? 1 : 0.4,
            }}
          >
            {t === 'star' && <Star />}
            {t === 'exclamation' && <AlertTriangle />}
            {t === 'question' && <HelpCircle />}
          </button>
        ))}
        <input
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="一言コメント"
          style={styles.input}
        />
      </div>
    </div>
  )
}