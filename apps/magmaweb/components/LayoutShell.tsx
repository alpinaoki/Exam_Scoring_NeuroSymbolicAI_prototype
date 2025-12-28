'use client'

import { usePathname, useRouter } from 'next/navigation'
import type { ReactNode, CSSProperties } from 'react'

type Props = {
  children: ReactNode
  onOpenPost?: () => void
}

export default function LayoutShell({ children, onOpenPost }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  // login 画面では何も包まない
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
          onClick={() => {
            if (onOpenPost) onOpenPost()
          }}
        >
          ＋
        </button>

        <button style={styles.icon} onClick={() => router.push('/me')}>
          👤
        </button>
      </footer>
    </div>
  )
}

const styles: { [key: string]: CSSProperties } = {
  wrapper: {
    minHeight: '100vh',
    paddingTop: 56,
    paddingBottom: 72,
    background: '#000',
    color: '#eee',
  },
  header: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: 56,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#111',
    zIndex: 1000,
    cursor: 'pointer',
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
    height: 72,
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
    width: 56,
    height: 56,
    borderRadius: '50%',
    fontSize: 32,
    background: '#fff',
    color: '#111',
    border: 'none',
    marginTop: -28,
  },
}
