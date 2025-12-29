'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import type { ReactNode, CSSProperties } from 'react'
import { createPost } from '../lib/posts'

type Props = {
  children: ReactNode
}

export default function LayoutShell({ children }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [openPost, setOpenPost] = useState(false)

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
          📰
        </button>

        <button
          style={styles.plus}
          onClick={() => setOpenPost(true)}
        >
          ＋
        </button>

        <button style={styles.icon} onClick={() => router.push('/me')}>
          👤
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
    const file = e.target.files?.[0]
    if (file) {
      // 次で使う
    }
  }}
/>

            <button
              onClick={async () => {
                await createPost({
                  type: 'problem',
                  imageUrl: 'test',
                })
                setOpenPost(false)
              }}
            >
              投稿（仮）
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
    background: '#eee',
    color: '#eee',
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
