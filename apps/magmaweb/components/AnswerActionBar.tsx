'use client'

import { useState, useEffect } from 'react'
import type { CSSProperties } from 'react'
import {
  Heart,
  Star,
  AlertTriangle,
  HelpCircle,
  SendHorizontal,
  X // 閉じるボタン用
} from 'lucide-react'
import { supabase } from '../lib/supabase'

type ReactionType = 'star' | 'exclamation' | 'question'

type Props = {
  problemId: string
  reactionCount: number
}

export default function AnswerActionBar({
  problemId,
  reactionCount,
}: Props) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<'position' | 'input'>('position') // 座標選択か入力か
  const [pos, setPos] = useState({ x: 0.5, y: 0.5 })
  const [type, setType] = useState<ReactionType>('star')
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  // ハートボタンを押した時の処理
  const toggleOpen = () => {
    if (!open) {
      setOpen(true)
      setStep('position')
      // ここでユーザーに「画像をクリックして」と伝えるためのヒントを出す
    } else {
      setOpen(false)
    }
  }

  // 画像がクリックされたことを検知するためのグローバルな処理
  // 注意: 本来はAnswerCardの画像にonClickを仕込むのがベストですが、
  // ActionBar単体で完結させるために「次に画面のどこかがクリックされたらそこを座標にする」簡易ロジックにします
  useEffect(() => {
    if (open && step === 'position') {
      const handleGlobalClick = (e: MouseEvent) => {
        // 画像要素を探す（もっとも近いimgタグなど）
        const img = document.querySelector('img[alt="answer"]')
        if (img && img.contains(e.target as Node)) {
          const rect = img.getBoundingClientRect()
          const x = (e.clientX - rect.left) / rect.width
          const y = (e.clientY - rect.top) / rect.height
          setPos({ x, y })
          setStep('input')
        }
      }
      window.addEventListener('click', handleGlobalClick)
      return () => window.removeEventListener('click', handleGlobalClick)
    }
  }, [open, step])

  async function submitReaction() {
    if (!comment.trim()) return

    try {
      setLoading(true)
      const { data } = await supabase.auth.getUser()
      const user = data.user
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase.from('reactions').insert({
        post_id: problemId,
        user_id: user.id,
        type,
        comment,
        x_float: pos.x,
        y_float: pos.y,
      })

      if (error) throw error

      setComment('')
      setOpen(false)
      window.location.reload() // 簡易的に再読込
    } catch (e) {
      console.error(e)
      alert('送信に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.wrapper}>
      <button
        style={{
          ...styles.action,
          color: open ? '#ff8c00' : '#888'
        }}
        onClick={toggleOpen}
      >
        <Heart size={20} fill={open ? '#ff8c00' : 'none'} />
        <span style={styles.countText}>リアクション {reactionCount}</span>
      </button>

      {open && (
        <div style={styles.reactionBox}>
          <div style={styles.boxHeader}>
            <span style={styles.stepTitle}>
              {step === 'position' ? '① 場所を選択' : '② メッセージを入力'}
            </span>
            <button onClick={() => setOpen(false)} style={styles.closeBtn}><X size={16}/></button>
          </div>

          {step === 'position' ? (
            <div style={styles.guide}>
              <div style={styles.pulseIcon} />
              <p style={styles.guideText}>画像の中の、リアクションしたい場所をタップしてください</p>
            </div>
          ) : (
            <>
              <div style={styles.typePicker}>
                <IconButton active={type === 'star'} label="なるほど" onClick={() => setType('star')}>
                  <Star size={18} fill={type === 'star' ? '#ff8c00' : 'none'} color={type === 'star' ? '#ff8c00' : '#666'} />
                </IconButton>
                <IconButton active={type === 'exclamation'} label="すごい！" onClick={() => setType('exclamation')}>
                  <AlertTriangle size={18} color={type === 'exclamation' ? '#ff8c00' : '#666'} />
                </IconButton>
                <IconButton active={type === 'question'} label="もっと詳しく" onClick={() => setType('question')}>
                  <HelpCircle size={18} color={type === 'question' ? '#ff8c00' : '#666'} />
                </IconButton>
              </div>

              <div style={styles.inputContainer}>
                <input
                  style={styles.input}
                  placeholder="メッセージ..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.nativeEvent.isComposing) submitReaction()
                  }}
                />
                <button onClick={submitReaction} style={styles.submit}>
                  <SendHorizontal size={18} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

/* ---------- 小コンポーネント (変更なし) ---------- */
function IconButton({ children, active, onClick, label }: any) {
  return (
    <button
      onClick={onClick}
      style={{
        ...styles.iconButton,
        backgroundColor: active ? 'rgba(255, 140, 0, 0.1)' : 'transparent',
        borderColor: active ? '#ff8c00' : 'transparent',
      }}
    >
      {children}
    </button>
  )
}

/* ---------- styles (追記・修正分) ---------- */
const styles: { [key: string]: CSSProperties } = {
  wrapper: { display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 },
  action: { display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', fontSize: '14px', fontWeight: 600 },
  countText: { color: '#666' },
  reactionBox: { 
    display: 'flex', flexDirection: 'column', gap: 12, padding: '16px', borderRadius: '20px', 
    background: '#fff', border: '1px solid #eee', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', maxWidth: '320px' 
  },
  boxHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  stepTitle: { fontSize: '12px', fontWeight: 700, color: '#ff8c00', letterSpacing: '0.05em' },
  closeBtn: { background: 'none', border: 'none', color: '#ccc', cursor: 'pointer' },
  guide: { padding: '20px 10px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 },
  guideText: { fontSize: '13px', color: '#555', lineHeight: 1.4, margin: 0 },
  pulseIcon: { width: 12, height: 12, background: '#ff8c00', borderRadius: '50%', boxShadow: '0 0 0 0 rgba(255, 140, 0, 0.7)', animation: 'pulse 1.5s infinite' },
  typePicker: { display: 'flex', gap: 8 },
  iconButton: { display: 'flex', padding: '10px', borderRadius: '12px', border: '1px solid transparent', cursor: 'pointer' },
  inputContainer: { display: 'flex', alignItems: 'center', gap: 8, background: '#f0f0f2', borderRadius: '12px', padding: '4px 4px 4px 12px' },
  input: { flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: '14px' },
  submit: { display: 'flex', background: '#333', color: '#fff', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' },
}
