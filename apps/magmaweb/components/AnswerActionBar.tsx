'use client'

import { useState, useEffect } from 'react'
import type { CSSProperties } from 'react'
import { Heart, Star, AlertTriangle, HelpCircle, SendHorizontal, X, GripHorizontal } from 'lucide-react'
import { supabase } from '../lib/supabase'

type ReactionType = 'star' | 'exclamation' | 'question'

type Props = {
  problemId: string
  reactionCount: number
  onPreviewChange: (val: { x: number, y: number, type: string } | null) => void
}

export default function AnswerActionBar({ problemId, reactionCount, onPreviewChange }: Props) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<'position' | 'input'>('position')
  const [pos, setPos] = useState({ x: 0.5, y: 0.5 })
  const [type, setType] = useState<ReactionType>('star')
  const [comment, setComment] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  // 親にプレビューを同期
  useEffect(() => {
    onPreviewChange(open && step === 'input' ? { ...pos, type } : null)
  }, [open, step, pos, type])

  // クリックで位置決定
  useEffect(() => {
    if (open && step === 'position') {
      const handleGlobalClick = (e: MouseEvent) => {
        const img = document.querySelector(`img[alt="answer"]`)
        if (img && img.contains(e.target as Node)) {
          const rect = img.getBoundingClientRect()
          setPos({ x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height })
          setStep('input')
        }
      }
      window.addEventListener('click', handleGlobalClick)
      return () => window.removeEventListener('click', handleGlobalClick)
    }
  }, [open, step])

  // ドラッグで位置調整
  useEffect(() => {
    if (!isDragging) return
    const move = (e: MouseEvent) => {
      const img = document.querySelector(`img[alt="answer"]`)
      if (!img) return
      const rect = img.getBoundingClientRect()
      setPos({
        x: Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)),
        y: Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))
      })
    }
    const up = () => setIsDragging(false)
    window.addEventListener('mousemove', move); window.addEventListener('mouseup', up)
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up) }
  }, [isDragging])

  async function submit() {
    if (!comment.trim()) return
    const { data } = await supabase.auth.getUser()
    await supabase.from('reactions').insert({
      post_id: problemId, user_id: data.user?.id, type, comment, x_float: pos.x, y_float: pos.y
    })
    window.location.reload()
  }

  return (
    <div style={styles.wrapper}>
      <button style={{ ...styles.action, color: open ? '#ff8c00' : '#888' }} onClick={() => setOpen(!open)}>
        <Heart size={20} fill={open ? '#ff8c00' : 'none'} />
        <span style={styles.countText}>リアクション {reactionCount}</span>
      </button>

      {open && step === 'position' && (
        <div style={styles.floatingGuide}>
          <div style={styles.pulse} />
          <span>画像をタップして場所を指定</span>
        </div>
      )}

      {open && step === 'input' && (
        <div style={{
          ...styles.inputBox,
          left: `${pos.x * 100}%`,
          top: `${pos.y * 100}%`,
          transform: `translate(${pos.x > 0.5 ? '-100%' : '0%'}, ${pos.y > 0.5 ? '-120%' : '20%'})`,
        }}>
          <div style={styles.boxHeader}>
            <div style={{ cursor: 'grab', display: 'flex', alignItems: 'center', gap: 4 }} onMouseDown={() => setIsDragging(true)}>
              <GripHorizontal size={14} color="#ccc" />
              <span style={{ fontSize: 10, color: '#999' }}>位置を調整</span>
            </div>
            <X size={14} color="#ccc" style={{ cursor: 'pointer' }} onClick={() => setOpen(false)} />
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            {(['star', 'exclamation', 'question'] as const).map(t => (
              <button key={t} onClick={() => setType(t)} style={{ 
                ...styles.typeBtn, 
                borderColor: type === t ? '#ff8c00' : '#eee',
                background: type === t ? '#fff9f2' : '#fff' 
              }}>
                {t === 'star' ? <Star size={16} fill={type === t ? '#ff8c00' : 'none'} color={type === t ? '#ff8c00' : '#666'} /> :
                 t === 'exclamation' ? <AlertTriangle size={16} color={type === t ? '#ff8c00' : '#666'} /> :
                 <HelpCircle size={16} color={type === t ? '#ff8c00' : '#666'} />}
              </button>
            ))}
          </div>

          <div style={styles.inputWrap}>
            <input autoFocus style={styles.input} placeholder="一言..." value={comment} onChange={e => setComment(e.target.value)} />
            <button onClick={submit} style={styles.submit}><SendHorizontal size={16} /></button>
          </div>
        </div>
      )}
    </div>
  )
}

const styles: { [key: string]: CSSProperties } = {
  wrapper: { position: 'static' },
  action: { display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 },
  countText: { color: '#666' },
  floatingGuide: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(0,0,0,0.8)', color: '#fff', padding: '10px 16px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: 8, fontSize: '12px', zIndex: 150 },
  pulse: { width: 8, height: 8, background: '#ff8c00', borderRadius: '50%', animation: 'pulse 1.5s infinite' },
  inputBox: { position: 'absolute', width: '220px', background: '#fff', border: '1px solid #ddd', borderRadius: '16px', padding: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.2)', zIndex: 200, display: 'flex', flexDirection: 'column', gap: 8 },
  boxHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: 2 },
  typeBtn: { flex: 1, display: 'flex', justifyContent: 'center', padding: '6px', borderRadius: '8px', border: '1px solid', cursor: 'pointer' },
  inputWrap: { display: 'flex', gap: 4, background: '#f5f5f7', borderRadius: '10px', padding: '4px 4px 4px 10px' },
  input: { flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: '13px' },
  submit: { background: '#333', color: '#fff', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }
}