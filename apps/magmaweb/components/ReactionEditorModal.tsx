'use client'

import { useEffect, useState } from 'react'
import { X, Heart, Star, HelpCircle, AlertCircle } from 'lucide-react'

type ReactionType = 'heart' | 'star' | 'question' | 'exclamation'

type Props = {
  open: boolean
  postId: string
  imageUrl: string
  onClose: () => void
}

export default function ReactionEditorModal({
  open,
  postId,
  imageUrl,
  onClose,
}: Props) {
  const [type, setType] = useState<ReactionType>('heart')

  // スクロール完全停止（ImageEditorModalと同じ）
  useEffect(() => {
    if (!open) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [open])

  if (!open) return null

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        {/* ヘッダー */}
        <div style={styles.header}>
          <div style={styles.types}>
            <IconButton active={type === 'heart'} onClick={() => setType('heart')}>
              <Heart />
            </IconButton>
            <IconButton active={type === 'star'} onClick={() => setType('star')}>
              <Star />
            </IconButton>
            <IconButton active={type === 'question'} onClick={() => setType('question')}>
              <HelpCircle />
            </IconButton>
            <IconButton active={type === 'exclamation'} onClick={() => setType('exclamation')}>
              <AlertCircle />
            </IconButton>
          </div>

          <button onClick={onClose} style={styles.close}>
            <X />
          </button>
        </div>

        {/* 本体 */}
        <div style={styles.imageWrapper}>
          <img src={imageUrl} alt="answer" style={styles.image} />
          {/* ここにドラッグ配置する⭐️!?を今後載せる */}
        </div>
      </div>
    </div>
  )
}

function IconButton({
  active,
  children,
  onClick,
}: {
  active?: boolean
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: 8,
        borderRadius: 8,
        border: active ? '2px solid #111' : '1px solid #ddd',
        background: '#fff',
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  )
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    zIndex: 1000,
  },
  container: {
    position: 'absolute',
    inset: 0,
    background: '#fff',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: 12,
    borderBottom: '1px solid #eee',
  },
  types: {
    display: 'flex',
    gap: 8,
  },
  close: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  imageWrapper: {
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#fafafa',
  },
  image: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
  },
}
