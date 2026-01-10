'use client'

import type { CSSProperties } from 'react'
import { SendHorizontal, Loader2 } from 'lucide-react'

type Props = {
  file: File
  uploading: boolean
  onCancel: () => void
  onPost: () => void
}

export default function ImageEditorModal({
  file,
  uploading,
  onCancel,
  onPost,
}: Props) {
  const imageUrl = URL.createObjectURL(file)

  return (
    <div style={styles.overlay} onClick={onCancel}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <button onClick={onCancel} style={styles.closeButton}>×</button>
          
          {/* 投稿ボタン */}
          <button 
            onClick={onPost} 
            disabled={uploading} 
            style={{
              ...styles.postButton,
              opacity: uploading ? 0.5 : 1 // 投稿中は少し薄くする
            }}
          >
            {uploading ? (
              // 投稿中はローディングアイコンをくるくる回す
              <Loader2 className="animate-spin" size={24} />
            ) : (
              // 通常時は紙飛行機のアイコン
              <SendHorizontal size={24} />
            )}
          </button>
        </div>

        {/* Image preview */}
        <div style={styles.body}>
          <img src={imageUrl} alt="preview" style={styles.image} />
        </div>
      </div>
    </div>
  )
}

const styles: { [key: string]: CSSProperties } = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.9)',
    zIndex: 3000,
  },
  modal: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    color: '#fff',
  },
  header: {
    height: 48,
    padding: '0 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid #333',
  },
  postButton: {
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    color: '#0095f6', // 青色など、投稿っぽい色にする
    padding: 4,
  },
  closeButton: {
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontSize: 24,
    padding: 4,
  },
  body: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
  },
}
