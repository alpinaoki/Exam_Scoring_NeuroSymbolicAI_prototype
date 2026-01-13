'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import type { ReactNode, CSSProperties } from 'react'
import { createPost } from '../lib/posts'
import { uploadImageToCloudinary } from '../lib/upload'
import ImageEditorModal from './ImageEditorModal'
import { UserRound, Sparkles } from 'lucide-react'

type Props = {
  children: ReactNode
}

export default function LayoutShell({ children }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  const cameraInputRef = useRef<HTMLInputElement>(null)

  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  if (pathname === '/login') {
    return <>{children}</>
  }

  return (
    <div style={styles.wrapper}>
      {/* Header */}
      <header style={styles.header} onClick={() => router.push('/feed')}>
        <span style={styles.logo}>Magmathe</span>
      </header>

      {/* Main */}
      <main style={styles.main}>{children}</main>

      {/* Footer */}
      <footer style={styles.footer}>
        <button style={styles.icon} onClick={() => router.push('/feed')}>
          <Sparkles size={30} />
        </button>

        <button
          style={styles.plus}
          onClick={() => cameraInputRef.current?.click()}
        >
          ＋
        </button>

        <button style={styles.icon} onClick={() => router.push('/me')}>
          <UserRound size={30} />
        </button>
      </footer>

      {/* Hidden camera input */}
      <input
  ref={cameraInputRef}
  type="file"
  accept="image/*"
  hidden
  onChange={(e) => {
    const f = e.target.files?.[0]
    if (f) setFile(f)
  }}
/>

      {/* Image Editor (dummy) */}
      {file && (
        <ImageEditorModal
          file={file}
          uploading={uploading}
          onCancel={() => {
            if (!uploading) setFile(null)
          }}
          onPost={async () => {
            if (uploading) return
            setUploading(true)

            const imageUrl = await uploadImageToCloudinary(file)
            await createPost({ imageUrl })

            setUploading(false)
            setFile(null)
            router.push('/feed')
          }}
        />
      )}
    </div>
  )
}

const styles: { [key: string]: CSSProperties } = {
  wrapper: {
    minHeight: '100vh',
    paddingTop: 32,
    paddingBottom: 54,
    background: '#fff',
  },
  header: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    background: '#111',
    zIndex: 1000,
    cursor: 'pointer',
    paddingLeft: 16,
  },
  logo: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#fff',
  },
  main: {
    paddingBottom: 16,
  },
  footer: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: 54,
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    background: '#111',
    zIndex: 1000,
  },
  icon: {
    background: 'none',
    border: 'none',
    color: '#eee',
  },
  plus: {
    width: 36, // 32だと枠が細くて窮屈に見える場合があるので少し調整
    height: 36,
    borderRadius: '50%',
    fontSize: 24,
    background: 'none',
    color: '#eee',
    border: '3px solid #444',
    cursor: 'pointer',
    
    // --- ここで真ん中に寄せる ---
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,         // ボタンのデフォルトパディングを消去
    lineHeight: 1,      // 行間の影響を排除
    // -------------------------
  }
}
