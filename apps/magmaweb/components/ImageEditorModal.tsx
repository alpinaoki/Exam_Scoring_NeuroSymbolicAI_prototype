'use client'

import type { CSSProperties } from 'react'

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
          <button onClick={onCancel}>×</button>
          <button onClick={onPost} disabled={uploading}>
            {uploading ? '投稿中…' : '投稿'}
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
