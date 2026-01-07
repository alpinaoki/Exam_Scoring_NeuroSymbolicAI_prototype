'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import type { ReactNode, CSSProperties } from 'react'
import { createPost } from '../lib/posts'
import { UserRound, Sparkles } from 'lucide-react'

type Props = {
  children: ReactNode
}


async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', 'posts_image')

  const res = await fetch(
    'https://api.cloudinary.com/v1_1/dk8pvfpzx/image/upload',
    {
      method: 'POST',
      body: formData,
    }
  )

  const data = await res.json()
  return data.secure_url
}



export default function LayoutShell({ children }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [openPost, setOpenPost] = useState(false)

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
  onClick={() => {
    setFile(null)
    setUploading(false)
    setOpenPost(true)
  }}
>
  ＋
</button>


        <button style={styles.icon} onClick={() => router.push('/me')}>
          <UserRound size={30} />
        </button>
      </footer>

      {/* Post Modal */}
      {openPost && (
        <div
          style={styles.overlay}
          onClick={() => setOpenPost(false)}
        >
          <div
            style={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <input
  type="file"
  accept="image/*"
  onChange={(e) => {
    const f = e.target.files?.[0]
    if (f) setFile(f)
  }}
/>
            <button
  disabled={!file || uploading}
  onClick={async () => {
    if (!file || uploading) return  // 念のため二重チェック

    setUploading(true)  // すぐに無効化

    const imageUrl = await uploadToCloudinary(file)

    await createPost({
      imageUrl,
    })

    setUploading(false)
    setOpenPost(false)
    setFile(null)
  }}
>
  {uploading ? '投稿中…' : '投稿（仮）'}
</button>

          </div>
        </div>
      )}
    </div>
  )
}


const styles: { [key: string]: CSSProperties } = {
  wrapper: {
    minHeight: '100vh',
    paddingTop: 32,
    paddingBottom: 54,
    background: '#ffffffff',
    color: '#ffffffff',
  },
  header: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    background: '#111',
    zIndex: 1000,
    cursor: 'pointer',
    paddingLeft:16
  },
  logo: {
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  main: {
    padding: '0 0 16px',
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
    fontSize: 22,
    background: 'none',
    border: 'none',
    color: '#eee',
    marginTop: 10
  },
  plus: {
    width: 42,
    height: 42,
    borderRadius: '30%',
    fontSize: 32,
    background: '#fff',
    color: '#111',
    border: 'none',
    marginTop: 10,
  },
  overlay: {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.6)',
  zIndex: 2000,
},
modal: {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: '40%',
  background: '#111',
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  padding: 16,
  color: '#fff',
},
}

