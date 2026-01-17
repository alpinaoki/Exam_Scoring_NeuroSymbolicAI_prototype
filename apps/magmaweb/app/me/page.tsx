'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import UserBadge from './UserBadge'

type Profile = {
  handle: string
}

type PostItem = {
  id: string
  image_url: string | null
  created_at: string
}

type AnswerItem = {
  id: string
  image_url: string | null
  parent_id: string
  created_at: string
}

export default function MePage() {
  const router = useRouter()

  const [activeTab, setActiveTab] =
    useState<'post' | 'answer' | 'settings'>('post')

  const [profile, setProfile] = useState<Profile | null>(null)
  const [myPosts, setMyPosts] = useState<PostItem[]>([])
  const [myAnswers, setMyAnswers] = useState<AnswerItem[]>([])
  const [loading, setLoading] = useState(true)

  /** 認証 & プロフィール取得 */
  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.replace('/login')
        return
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('handle')
        .eq('user_id', data.user.id)
        .single()

      setProfile(profileData)
    })
  }, [router])

  /** 自分の投稿・返信取得 */
  useEffect(() => {
    async function loadMyData() {
      try {
        const { getMyProblems, getMyAnswers } = await import('../../lib/posts')

        const [posts, answers] = await Promise.all([
          getMyProblems(),
          getMyAnswers(),
        ])

        setMyPosts(posts ?? [])
        setMyAnswers(answers ?? [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }

    loadMyData()
  }, [])

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
  <UserBadge
    username={profile?.handle ?? 'unknown'}
    size={48}
  />
  <div>
    <div style={styles.name}>You</div>
    <div style={styles.id}>@{profile?.handle ?? 'unknown'}</div>
  </div>
</section>


      {/* Tabs */}
      <section style={styles.tabs}>
        <span
          style={activeTab === 'post' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('post')}
        >
          投稿
        </span>

        <span
          style={activeTab === 'answer' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('answer')}
        >
          返信
        </span>

        <span
          style={activeTab === 'settings' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('settings')}
        >
          設定
        </span>
      </section>

      {/* Content */}
      <section style={styles.content}>
        {activeTab === 'settings' && (
          <button style={styles.logout} onClick={handleLogout}>
            ログアウト
          </button>
        )}

        {activeTab === 'post' && (
          <>
            {loading ? (
              <div style={styles.empty}>読み込み中…</div>
            ) : myPosts.length === 0 ? (
              <div style={styles.empty}>まだ投稿がありません</div>
            ) : (
              myPosts.map((p) => (
                <img
                  key={p.id}
                  src={p.image_url ?? ''}
                  alt="post"
                  style={styles.thumb}
                  onClick={() => router.push(`/threads/${p.id}`)}
                />
              ))
            )}
          </>
        )}

        {activeTab === 'answer' && (
          <>
            {loading ? (
              <div style={styles.empty}>読み込み中…</div>
            ) : myAnswers.length === 0 ? (
              <div style={styles.empty}>まだ返信がありません</div>
            ) : (
              myAnswers.map((a) => (
                <img
                  key={a.id}
                  src={a.image_url ?? ''}
                  alt="answer"
                  style={styles.thumb}
                  onClick={() => router.push(`/threads/${a.parent_id}`)}
                />
              ))
            )}
          </>
        )}
      </section>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  wrapper: { padding: '16px', color: '#111' },
  profile: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  name: { fontWeight: 'bold', fontSize: 16 },
  id: { fontSize: 12, color: '#555' },
  tabs: {
    display: 'flex',
    gap: 16,
    borderBottom: '1px solid #ccc',
    paddingBottom: 8,
    marginBottom: 16,
  },
  tab: { fontSize: 14, color: '#777', cursor: 'pointer' },
  tabActive: {
    fontSize: 14,
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  content: { minHeight: 200 },
  empty: { fontSize: 14, color: '#666' },
  logout: {
    width: '100%',
    padding: '12px 0',
    background: '#111',
    color: '#eee',
    border: 'none',
    borderRadius: 6,
    fontSize: 14,
  },
  thumb: {
    width: '100%',
    borderRadius: 8,
    border: '1px solid #eee',
    marginBottom: 12,
    cursor: 'pointer',
  },
}
