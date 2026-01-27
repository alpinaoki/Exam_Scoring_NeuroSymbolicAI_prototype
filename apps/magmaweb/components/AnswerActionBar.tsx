'use client'

import { useState, useEffect } from 'react'
import type { CSSProperties } from 'react'
import { Heart, Star, AlertTriangle, HelpCircle, SendHorizontal, X } from 'lucide-react'
import { supabase } from '../lib/supabase'

type ReactionType = 'star' | 'exclamation' | 'question'

export default function AnswerActionBar({ problemId, reactionCount, onPreviewChange }: any) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<'position' | 'input'>('position')
  const [pos, setPos] = useState({ x: 0.5, y: 0.5 })
  const [type, setType] = useState<ReactionType>('star')
  const [comment, setComment] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  // 親コンポーネントへのプレビュー同期
  useEffect(() => {
    onPreviewChange(open && step === 'input' ? { ...pos, type, isDragging } : null)
  }, [open, step, pos, type, isDragging, onPreviewChange])

  // ステップ1: 画像クリックで位置を決定
  useEffect(() => {
    if (open && step === 'position') {
      const handleClick = (e: MouseEvent) => {
        const img = document.querySelector('img[alt="answer"]')
        if (img && img.contains(e.target as Node)) {
          const rect = img.getBoundingClientRect()
          setPos({ 
            x: (e.clientX - rect.left) / rect.width, 
            y: (e.clientY - rect.top) / rect.height 
          })
          setStep('input')
        }
      }
      window.addEventListener('click', handleClick)
      return () => window.removeEventListener('click', handleClick)
    }
  }, [open, step])

  // ステップ2: ピン（preview-pin）のドラッグ開始検知
  useEffect(() => {
    const pin = document.getElementById('preview-pin')
    if (!pin || step !== 'input') return

    const startDragging = (e: any) => {
      e.preventDefault()
      setIsDragging(true)
    }

    pin.addEventListener('mousedown', startDragging)
    pin.addEventListener('touchstart', startDragging, { passive: false })

    return () => {
      pin.removeEventListener('mousedown', startDragging)
      pin.removeEventListener('touchstart', startDragging)
    }
  }, [step, open])

  // ドラッグ移動中の座標計算
  useEffect(() => {
    if (!isDragging) return
    const handleMove = (e: any) => {
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
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleEnd)
      window.removeEventListener('touchmove', handleMove)
      window.removeEventListener('touchend', handleEnd)
    }
  }, [isDragging])

  const handleSubmit = async () => {
    if (!comment.trim()) return
    const { data } = await supabase.auth.getUser()
    await supabase.from('reactions').insert({ 
      post_id: problemId, 
      user_id: data.user?.id, 
      type, 
      comment, 
      x_float: pos.x, 
      y_float: pos.y 
    })
    window.location.reload()
  }

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
          // ★ ピンの少し上に表示（指で隠れないように）
          transform: 'translate(-50%, -130%)',
          // ★ ドラッグ中は入力を隠す
          opacity: isDragging ? 0 : 1,
          pointerEvents: isDragging ? 'none' : 'auto',
          visibility: isDragging ? 'hidden' : 'visible',
          transition: 'opacity 0.15s ease, transform 0.2s ease',
        }}>
          <div style={styles.boxHeader}>
            <span style={{ fontSize: '10px', color: '#999', fontWeight: 600 }}>アイコンをドラッグして位置調整</span>
            <X size={16} color="#ccc" onClick={() => setOpen(false)} style={{ cursor: 'pointer' }} />
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            {(['star', 'exclamation', 'question'] as const).map((t) => (
              <button 
                key={t}
                type="button" 
                onClick={(e) => { e.stopPropagation(); setType(t); }} 
                style={{ 
                  ...styles.typeBtn, 
                  borderColor: type === t ? '#ff8c00' : '#eee', 
                  color: type === t ? '#ff8c00' : '#666', 
                  background: type === t ? '#fff9f2' : '#fff' 
                }}
              >
                {t === 'star' && <Star size={18} fill={type === t ? "#ff8c00" : "none"} />}
                {t === 'exclamation' && <AlertTriangle size={18} fill={type === t ? "#ff8c00" : "none"} />}
                {t === 'question' && <HelpCircle size={18} fill={type === t ? "#ff8c00" : "none"} />}
              </button>
            ))}
          </div>

          {/* ★ 送信ボタンを中に統合した入力ボックス */}
          <div style={styles.inputContainer}>
            <input 
              autoFocus 
              style={styles.input} 
              placeholder="一言..." 
              value={comment} 
              onChange={e => setComment(e.target.value)} 
            />
            {comment.trim() && (
              <button onClick={handleSubmit} style={styles.sendIconBtn}>
                <SendHorizontal size={18} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function TypeBtn({ children, active, onClick }: any) {
  // ※ループ内で定義しているため、この関数は予備用です
  return (
    <button type="button" onClick={onClick} style={{ ...styles.typeBtn }}>
      {children}
    </button>
  )
}

const styles: { [key: string]: CSSProperties } = {
  heartBtn: { display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0', fontWeight: 600 },
  guide: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(0,0,0,0.8)', color: '#fff', padding: '12px 20px', borderRadius: '40px', zIndex: 2000, pointerEvents: 'none' },
  inputBox: { 
    position: 'absolute', width: '240px', background: '#fff', border: '1px solid #ddd', 
    borderRadius: '16px', padding: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', 
    zIndex: 3000, display: 'flex', flexDirection: 'column', gap: 10,
    willChange: 'left, top'
  },
  boxHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  typeBtn: { flex: 1, display: 'flex', justifyContent: 'center', padding: '8px', borderRadius: '10px', border: '1px solid', cursor: 'pointer', transition: 'all 0.2s' },
  inputContainer: { position: 'relative', display: 'flex', alignItems: 'center', background: '#f5f5f7', borderRadius: '12px', overflow: 'hidden' },
  input: { 
    flex: 1, background: 'transparent', border: 'none', outline: 'none', 
    fontSize: '16px', // iOSのズーム防止に必須
    padding: '10px 45px 10px 12px', color: '#333' 
  },
  sendIconBtn: { 
    position: 'absolute', right: '4px', background: '#333', color: '#fff', 
    border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  }
}