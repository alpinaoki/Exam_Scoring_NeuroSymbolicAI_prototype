'use client'

import { useParams } from 'next/navigation'

export default function SearchResultPage() {
  const params = useParams()
  const keyword = decodeURIComponent(params.id as string)

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700 }}>
        #{keyword}
      </h2>

      <p style={{ color: '#777', marginTop: 8 }}>
        「{keyword}」の検索結果（準備中）
      </p>
    </div>
  )
}
