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
  username: string
  onClose: () => void
}

export default function ReactionEditorModal({
  open,
  imageUrl,
  postId,
  username,
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

  // 座標計算の修正：object-fit: contain による余白を考慮した正確な正規化
  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    const img = imgRef.current
    if (!img) return

    const rect = img.getBoundingClientRect()
    
    // 要素内のクリック座標
    const offsetX = e.clientX - rect.left
    const offsetY = e.clientY - rect.top

    // 画像の本来の縦横比と表示されている縦横比から、実際の描画領域を算出
    const imgRatio = img.naturalWidth / img.naturalHeight
    const containerRatio = rect.width / rect.height

    let actualWidth, actualHeight, startX, startY

    if (containerRatio > imgRatio) {
      // 左右に余白がある場合
      actualHeight = rect.height
      actualWidth = rect.height * imgRatio
      startX = (rect.width - actualWidth) / 2
      startY = 0
    } else {
      // 上下に余白がある場合
      actualWidth = rect.width
      actualHeight = rect.width / imgRatio
      startX = 0
      startY = (rect.height - actualHeight) / 2
    }

    // 描画エリア内での相対座標を計算 (0.0 ~ 1.0)
    const x = (offsetX - startX) / actualWidth
    const y = (offsetY - startY) / actualHeight

    // 範囲外クリック（余白部分）は無視
    if (x < 0 || x > 1 || y < 0 || y > 1) return

    setPos({ x, y })
  }

  const submit = async () => {
    if (!pos || saving) return
    setSaving(true)

    try {
      const finalComment =
        type === 'question'
          ? JSON.stringify([
              {
                username,
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
      setPos(null)
      setComment('')
    } catch (e) {
      console.error(e)
      alert('リアクションの保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  // カラー定数
  const COLORS = {
    star: '#FFE066',
    exclamation: '#FFAD99',
    question: '#4D96FF',
    bg: '#1a1a1a'
  }

  const iconMap = {
    star: <Star size={20} fill={COLORS.star} stroke="#333" strokeWidth={1} />,
    exclamation: <AlertTriangle size={20} fill={COLORS.exclamation} stroke="#333" strokeWidth={1} />,
    question: <HelpCircle size={20} fill={COLORS.question} stroke="#333" strokeWidth={1} />,
  }

  return createPortal(
    <div style={styles.overlay}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <button onClick={onClose} style={styles.iconBtn}>
            <X size={24} />
          </button>
          <span style={styles.headerTitle}>位置を指定してリアクション</span>
          <button
            onClick={submit}
            disabled={!pos || saving}
            style={{
              ...styles.submitHeader,
              color: pos && !saving ? '#4D96FF' : '#666',
            }}
          >
            {saving ? '...' : <Send size={22} />}
          </button>
        </div>

        {/* Canvas Area */}
        <div style={styles.canvas}>
          <div style={styles.imageWrapper}>
            <img
              ref={imgRef}
              src={imageUrl}
              style={styles.image}
              alt="Target"
              onClick={handleImageClick}
              draggable={false}
            />

            {!pos && (
              <div style={styles.tapHint}>
                画像をタップしてマーカーを設置
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
              <button
                key={t}
                onClick={() => setType(t)}
                style={{
                  ...styles.typeButton,
                  background: type === t ? `${COLORS[t]}22` : 'rgba(255,255,255,0.05)',
                  borderColor: type === t ? COLORS[t] : 'rgba(255,255,255,0.1)',
                  color: type === t ? '#fff' : '#888',
                }}
              >
                {t === 'star' && <Star size={20} fill={type === t ? COLORS.star : 'none'} stroke={type === t ? '#333' : '#888'} />}
                {t === 'exclamation' && <AlertTriangle size={20} fill={type === t ? COLORS.exclamation : 'none'} stroke={type === t ? '#333' : '#888'} />}
                {t === 'question' && <HelpCircle size={20} fill={type === t ? COLORS.question : 'none'} stroke={type === t ? '#333' : '#888'} />}
                <span style={styles.typeLabel}>{typeLabels[t]}</span>
              </button>
            ))}
          </div>

          <div style={styles.inputWrapper}>
            <input
              placeholder={type === 'question' ? "質問・不明点を入力..." : "コメントを追加 (任意)..."}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={styles.input}
              autoFocus
            />
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

const typeLabels = {
  star: 'なるほど',
  exclamation: 'ミス指摘',
  question: '質問',
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
    padding: '0 16px',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: '#000',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  headerTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#eee',
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
    cursor: 'pointer',
    padding: '8px',
    transition: 'all 0.2s',
  },
  canvas: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    background: '#0a0a0a',
  },
  imageWrapper: {
    position: 'relative',
    display: 'inline-block',
    maxWidth: '100%',
    maxHeight: '100%',
  },
  image: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
    display: 'block',
    userSelect: 'none',
  },
  tapHint: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '13px',
    color: '#fff',
    background: 'rgba(0,0,0,0.5)',
    padding: '8px 16px',
    borderRadius: '20px',
    pointerEvents: 'none',
    whiteSpace: 'nowrap',
  },
  marker: {
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    zIndex: 10,
    pointerEvents: 'none',
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
  },
  controls: {
    padding: '24px 20px 48px',
    background: '#000',
    borderTop: '1px solid rgba(255,255,255,0.1)',
  },
  typeRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '24px',
  },
  typeButton: {
    flex: 1,
    maxWidth: '110px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 4px',
    borderRadius: '16px',
    border: '2px solid',
    fontSize: '11px',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  },
  typeLabel: {
    fontWeight: 700,
  },
  inputWrapper: {
    maxWidth: '500px',
    margin: '0 auto',
  },
  input: {
    width: '100%',
    background: '#222',
    border: '1px solid #333',
    borderRadius: '12px',
    padding: '14px 18px',
    color: '#fff',
    fontSize: '16px',
    outline: 'none',
  },
}