'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import LayoutShell from '../../../components/LayoutShell'
import ProblemCard from '../../../components/ProblemCard'
import { searchProblemsByLabel } from '../../../lib/posts'

type ProblemItem = {
  id: string
  image_url: string | null
  created_at: string
  label: string | null
  profiles: {
    handle: string
  } | null
}

export default function SearchResultPage() {
  const params = useParams()
  const router = useRouter()
  const keyword = decodeURIComponent(params.id as string)

  const [problems, setProblems] = useState<ProblemItem[]>([])
  const [loading, setLoading] = useState(true)

  /** 認証チェック（feed と同じ） */
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

  /** 検索 */
  useEffect(() => {
    async function load() {
      try {
        const data = await searchProblemsByLabel(keyword)
        setProblems(data ?? [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [keyword])

  return (
    <LayoutShell>
      <div style={{ padding: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>
          #{keyword}
        </h2>

        {loading ? (
          <p style={{ color: '#777', marginTop: 12 }}>
            読み込み中…
          </p>
        ) : problems.length === 0 ? (
          <p style={{ color: '#777', marginTop: 12 }}>
            「{keyword}」に一致する問題はありません
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 16 }}>
            {problems.map((p) => (
              <ProblemCard
                key={p.id}
                image={p.image_url}
                problemId={p.id}
                username={p.profiles?.handle ?? 'unknown'}
                createdAt={p.created_at}
                label={p.label}
              />
            ))}
          </div>
        )}
      </div>
    </LayoutShell>
  )
}
