'use client'

import { useState, useEffect } from 'react'
import type { CSSProperties } from 'react'
import { Heart, Star, AlertTriangle, HelpCircle, SendHorizontal, X, GripHorizontal } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function AnswerActionBar({ problemId, reactionCount, onPreviewChange }: any) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<'position' | 'input'>('position')
  const [pos, setPos] = useState({ x: 0.5, y: 0.5 })
  const [type, setType] = useState<ReactionType>('star')
  const [comment, setComment] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  // 親（AnswerCard）へのプレビュー同期
  useEffect(() => {
    onPreviewChange(open && step === 'input' ? { ...pos, type } : null)
  }, [open, step, pos, type, onPreviewChange])

  // 画像クリックで位置確定
  useEffect(() => {
    if (open && step === 'position') {
      const handleClick = (e: MouseEvent) => {
        const img = document.querySelector('img[alt="answer"]')
        if (img && img.contains(e.target as Node)) {
          const rect = img.getBoundingClientRect()
          setPos({ x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height })
          setStep('input')
        }
      }
      window.addEventListener('click', handleClick)
      return () => window.removeEventListener('click', handleClick)
    }
  }, [open, step])

  // ドラッグ操作（移動中はボックスを隠す）
  useEffect(() => {
    if (!isDragging) return
    const handleMove = (e: any) => {
      // ズームやスクロールを完全にブロック
      if (e.cancelable) e.preventDefault()
      
      const img = document.querySelector('img[alt="answer"]')
      if (!img) return
      const rect = img.getBoundingClientRect()
      const clientX = e.touches ? e.touches[0].clientX : e.clientX
      const clientY = e.touches ? e.touches[0].clientY : e.clientY
      
      setPos({
        x: Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)),
        y: Math.max(0, Math.min(1, (clientY - rect.top) / rect.height))
      })
    }
    const handleEnd = () => setIsDragging(false)
    
    window.addEventListener('mousemove', handleMove, { passive: false })
    window.addEventListener('mouseup', handleEnd)
    window.addEventListener('touchmove', handleMove, { passive: false })
    window.addEventListener('touchend', handleEnd)
    return () => {
      window.removeEventListener('mousemove', handleMove); window.removeEventListener('mouseup', handleEnd)
      window.removeEventListener('touchmove', handleMove); window.removeEventListener('touchend', handleEnd)
    }
  }, [isDragging])

  return (
    <div style={{ position: 'static' }}>
      <button style={styles.heartBtn} onClick={() => { setOpen(!open); setStep('position'); }}>
        <Heart size={20} fill={open ? '#ff8c00' : 'none'} color={open ? '#ff8c00' : '#888'} />
        <span style={{ color: '#666', fontSize: '14px' }}>リアクション {reactionCount}</span>
      </button>

      {open && step === 'position' && (
        <div style={styles.guide}>画像をタップして場所を指定</div>
      )}

      {open && step === 'input' && (
        <div style={{
          ...styles.inputBox,
          left: `${pos.x * 100}%`,
          top: `${pos.y * 100}%`,
          transform: `translate(${pos.x > 0.5 ? '-105%' : '5%'}, ${pos.y > 0.5 ? '-105%' : '5%'})`,
          // ★ ドラッグ中は透明にして、中身を非表示にする
          opacity: isDragging ? 0 : 1,
          visibility: isDragging ? 'hidden' : 'visible',
          transition: isDragging ? 'none' : 'opacity 0.2s ease-in-out',
        }}>
          <div 
            style={styles.dragHeader} 
            onMouseDown={(e) => { e.preventDefault(); setIsDragging(true); }}
            onTouchStart={(e) => { setIsDragging(true); }}
          >
            <GripHorizontal size={16} color="#ccc" />
            <span style={{ fontSize: '10px', color: '#999' }}>ドラッグで移動</span>
            <X size={16} onClick={() => setOpen(false)} style={{ marginLeft: 'auto', cursor: 'pointer' }} />
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            <TypeBtn active={type === 'star'} onClick={() => setType('star')}><Star size={18} fill={type === 'star' ? "#ff8c00" : "none"} /></TypeBtn>
            <TypeBtn active={type === 'exclamation'} onClick={() => setType('exclamation')}><AlertTriangle size={18} fill={type === 'exclamation' ? "#ff8c00" : "none"} /></TypeBtn>
            <TypeBtn active={type === 'question'} onClick={() => setType('question')}><HelpCircle size={18} fill={type === 'question' ? "#ff8c00" : "none"} /></TypeBtn>
          </div>

          <div style={styles.inputRow}>
            <input 
              autoFocus 
              style={styles.input} 
              placeholder="一言..." 
              value={comment} 
              onChange={e => setComment(e.target.value)} 
            />
            <button onClick={async () => {
              const { data } = await supabase.auth.getUser()
              await supabase.from('reactions').insert({ post_id: problemId, user_id: data.user?.id, type, comment, x_float: pos.x, y_float: pos.y })
              window.location.reload()
            }} style={styles.sendBtn}><SendHorizontal size={18} /></button>
          </div>
        </div>
      )}
    </div>
  )
}

function TypeBtn({ children, active, onClick }: any) {
  return (
    <button onClick={onClick} style={{ ...styles.typeBtn, borderColor: active ? '#ff8c00' : '#eee', color: active ? '#ff8c00' : '#666' }}>
      {children}
    </button>
  )
}

const styles: { [key: string]: CSSProperties } = {
  heartBtn: { display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0', fontWeight: 600 },
  guide: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(0,0,0,0.8)', color: '#fff', padding: '12px 20px', borderRadius: '40px', zIndex: 2000, pointerEvents: 'none' },
  inputBox: { 
    position: 'absolute', width: '220px', background: '#fff', border: '1px solid #ddd', borderRadius: '16px', padding: '12px', 
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)', zIndex: 3000, display: 'flex', flexDirection: 'column', gap: 10,
    touchAction: 'none'
  },
  dragHeader: { display: 'flex', alignItems: 'center', gap: 6, cursor: 'grab', paddingBottom: 4, borderBottom: '1px solid #f0f0f0' },
  typeBtn: { flex: 1, display: 'flex', justifyContent: 'center', padding: '8px', borderRadius: '10px', border: '1px solid', cursor: 'pointer', background: '#fff' },
  inputRow: { display: 'flex', background: '#f5f5f7', borderRadius: '12px', padding: '4px 4px 4px 12px' },
  input: { 
    flex: 1, background: 'transparent', border: 'none', outline: 'none', 
    fontSize: '16px', // ★ iOSの自動ズームを防ぐため16px以上に設定
    color: '#333'
  },
  sendBtn: { background: '#333', color: '#fff', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }
}