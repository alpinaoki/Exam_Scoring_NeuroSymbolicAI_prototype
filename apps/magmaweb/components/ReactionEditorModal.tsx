'use client'

import { useState, useEffect } from 'react'
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

export default function ReactionEditorModal({ open, imageUrl, postId, onClose }: Props) {
  const [pos, setPos] = useState({ x: 0.5, y: 0.5 })
  const [type, setType] = useState<ReactionType>('star')
  const [comment, setComment] = useState('')
  const [dragging, setDragging] = useState(false)

  // 指が画像外に出てもドラッグを継続させるための処理
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

  const renderIcon = (size = 32) => {
    const props = { size, style: { filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' } }
    if (type === 'star') return <Star {...props} fill="#FFD700" color="#FFD700" />
    if (type === 'exclamation') return <AlertTriangle {...props} fill="#FF4500" color="#FF4500" />
    return <HelpCircle {...props} fill="#00BFFF" color="#00BFFF" />
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.header}>
        <X size={28} onClick={onClose} style={{ cursor: 'pointer' }} />
        <span style={{ fontWeight: 700 }}>位置を調整して送信</span>
        <div style={{ width: 28 }} /> {/* バランス用 */}
      </div>

      <div style={styles.body} onPointerDown={(e) => {
        setDragging(true)
        const img = document.getElementById('reaction-editor-img')
        if (img) {
          const r = img.getBoundingClientRect()
          setPos({
            x: Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)),
            y: Math.max(0, Math.min(1, (e.clientY - r.top) / r.height)),
          })
        }
      }}>
        <img
          id="reaction-editor-img"
          src={imageUrl}
          style={styles.image}
          draggable={false}
        />
        <div style={{ ...styles.pin, left: `${pos.x * 100}%`, top: `${pos.y * 100}%` }}>
          {renderIcon()}
        </div>
      </div>

      <div style={styles.footer}>
        <div style={styles.typeRow}>
          {(['star', 'exclamation', 'question'] as const).map(t => (
            <button key={t} onClick={() => setType(t)} style={{ ...styles.typeBtn, background: type === t ? '#eee' : 'transparent', border: type === t ? '1px solid #ccc' : '1px solid transparent' }}>
              {t === 'star' && <Star size={24} fill="#FFD700" color="#FF8C00" />}
              {t === 'exclamation' && <AlertTriangle size={24} fill="#FF4500" color="#B22222" />}
              {t === 'question' && <HelpCircle size={24} fill="#00BFFF" color="#00008B" />}
            </button>
          ))}
        </div>

        <div style={styles.inputWrapper}>
          <input
            autoFocus
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="一言コメントを入力..."
            style={styles.input}
          />
          <button onClick={submit} style={{ ...styles.sendBtn, opacity: comment.trim() ? 1 : 0.3 }} disabled={!comment.trim()}>
            <SendHorizontal size={22} />
          </button>
        </div>
      </div>
    </div>
  )
}

const styles: { [key: string]: CSSProperties } = {
  overlay: { position: 'fixed', inset: 0, backgroundColor: '#fff', zIndex: 10000, display: 'flex', flexDirection: 'column' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #eee' },
  body: { position: 'relative', flex: 1, backgroundColor: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', touchAction: 'none' },
  image: { maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', userSelect: 'none' },
  pin: { position: 'absolute', transform: 'translate(-50%, -100%)', pointerEvents: 'none', transition: 'none' },
  footer: { padding: '16px', borderTop: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: 12 },
  typeRow: { display: 'flex', justifyContent: 'center', gap: 20 },
  typeBtn: { padding: '8px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
  input: { width: '100%', padding: '14px 50px 14px 16px', borderRadius: '24px', border: '1px solid #ddd', fontSize: '16px', outline: 'none', backgroundColor: '#f8f8f8' },
  sendBtn: { position: 'absolute', right: '8px', background: '#007AFF', color: '#fff', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }
}