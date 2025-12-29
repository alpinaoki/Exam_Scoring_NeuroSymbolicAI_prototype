'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

export default function MePage() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace('/login')
      }
    })
  }, [router])

  const handleLogout = async () => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.auth.signOut()
    router.replace('/login')
  }

  return (
    <div style={styles.wrapper}>
      {/* Profile */}
      <section style={styles.profile}>
        <div style={styles.avatar} />
        <div>
          <div style={styles.name}>Your Name</div>
          <div style={styles.id}>@your_id</div>
        </div>
      </section>

      {/* Tabs (ダミー) */}
      <section style={styles.tabs}>
        <span style={styles.tabActive}>投稿</span>
        <span style={styles.tab}>返信</span>
      </section>

      {/* Content */}
      <section style={styles.content}>
        <div style={styles.empty}>
          まだ投稿がありません
        </div>
      </section>

      {/* Logout */}
      <button style={styles.logout} onClick={handleLogout}>
        ログアウト
      </button>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  wrapper: {
    padding: '16px',
    color: '#111',
  },
  profile: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    background: '#999',
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  id: {
    fontSize: 12,
    color: '#555',
  },
  tabs: {
    display: 'flex',
    gap: 16,
    borderBottom: '1px solid #ccc',
    paddingBottom: 8,
    marginBottom: 16,
  },
  tab: {
    fontSize: 14,
    color: '#777',
  },
  tabActive: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  content: {
    minHeight: 200,
  },
  empty: {
    fontSize: 14,
    color: '#666',
  },
  logout: {
    marginTop: 32,
    width: '100%',
    padding: '12px 0',
    background: '#111',
    color: '#eee',
    border: 'none',
    borderRadius: 6,
    fontSize: 14,
  },
}
