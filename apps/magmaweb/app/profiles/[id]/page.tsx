'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import UserBadge from '../../../components/UserBadge'

type Profile = {
  handle: string
}

type PostItem = {
  id: string
  image_url: string | null
  created_at: string
}

export default function ProfilePage() {
  const router = useRouter()
  const params = useParams()

  // 🔑 URL の id は handle として扱う
  const handle = params.id as string

  const [profile, setProfile] = useState<Profile | null>(null)
  const [posts, setPosts] = useState<PostItem[]>([])
  const [loading, setLoading] = useState(true)

  /** プロフィール取得（handle ベース） */
  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    async function loadProfile() {
      const { data, error } = await supabase
        .from('profiles')
        .select('handle')
        .eq('handle', handle)
        .single()

      if (error) {
        console.error(error)
        return
      }

      setProfile(data)
    }

    loadProfile()
  }, [handle])

  /** その人の投稿取得（handle → user_id → posts） */
  useEffect(() => {
    async function loadPosts() {
      try {
        const { getProblemsByHandle } = await import('../../../lib/posts')
        const data = await getProblemsByHandle(handle)
        setPosts(data ?? [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }

    loadPosts()
  }, [handle])

  return (
    <div style={styles.wrapper}>
      {/* Profile */}
      <section style={styles.profile}>
        <UserBadge
          username={profile?.handle ?? handle}
          size={48}
        />
        <div>
          <div style={styles.name}>
            {profile?.handle ?? handle}
          </div>
          <div style={styles.id}>
            @{profile?.handle ?? handle}
          </div>
        </div>
      </section>

      {/* Posts */}
      <section>
        {loading ? (
          <div style={styles.empty}>読み込み中…</div>
        ) : posts.length === 0 ? (
          <div style={styles.empty}>まだ投稿がありません</div>
        ) : (
          posts.map((p) => (
            <img
              key={p.id}
              src={p.image_url ?? ''}
              alt="post"
              style={styles.thumb}
              onClick={() => router.push(`/threads/${p.id}`)}
            />
          ))
        )}
      </section>
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
    marginBottom: 24,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  id: {
    fontSize: 12,
    color: '#555',
  },
  empty: {
    fontSize: 14,
    color: '#666',
  },
  thumb: {
    width: '100%',
    borderRadius: 8,
    border: '1px solid #eee',
    marginBottom: 12,
    cursor: 'pointer',
  },
}
