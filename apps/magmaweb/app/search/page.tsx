'use client'

import { useRouter } from 'next/navigation'
import { useState, useMemo } from 'react'
import { COURSE_TAGS, OTHER_TAGS, UNIT_TAGS } from '../../lib/mathTags'

export default function SearchPage() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  // 全タグを統合してサジェスト用リストを作成
  const allTags = useMemo(() => {
    return Array.from(new Set([...COURSE_TAGS, ...UNIT_TAGS, ...OTHER_TAGS]))
  }, [])

  const goTag = (tag: string) => {
    if (!tag.trim()) return
    router.push(`/search/${encodeURIComponent(tag.trim())}`)
  }

  return (
    <div style={{ padding: 16, maxWidth: 600, margin: '0 auto' }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>検索</h2>

      {/* ★ 自由入力検索 */}
      <div style={styles.searchBox}>
        <input
          type="text"
          list="tag-suggestions" // datalistと紐付け
          placeholder="タグ・キーワードを入力"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') goTag(query)
          }}
          style={styles.input}
        />
        {/* サジェスト候補のリスト */}
        <datalist id="tag-suggestions">
          {allTags.map(tag => (
            <option key={tag} value={tag} />
          ))}
        </datalist>

        <button
          style={styles.searchButton}
          onClick={() => goTag(query)}
        >
          検索
        </button>
      </div>

      {/* 課程タグ */}
      <section style={{ marginTop: 24 }}>
        <h3 style={styles.sectionTitle}>課程</h3>
        <div style={styles.tagRow}>
          {COURSE_TAGS.map((t) => (
            <button key={t} style={styles.tag} onClick={() => goTag(t)}>
              #{t}
            </button>
          ))}
        </div>
      </section>

      {/* 単元タグ */}
      <section style={{ marginTop: 28 }}>
        <h3 style={styles.sectionTitle}>単元</h3>
        <div style={styles.tagRow}>
          {UNIT_TAGS.map((t) => (
            <button key={t} style={styles.tag} onClick={() => goTag(t)}>
              #{t}
            </button>
          ))}
        </div>
      </section>

      {/* その他 */}
      <section style={{ marginTop: 28 }}>
        <h3 style={styles.sectionTitle}>その他</h3>
        <div style={styles.tagRow}>
          {OTHER_TAGS.map((t) => (
            <button key={t} style={styles.tag} onClick={() => goTag(t)}>
              #{t}
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  searchBox: {
    display: 'flex',
    gap: 8,
    position: 'relative',
  },
  input: {
    flex: 1,
    fontSize: 16,            // ← iOSの勝手なズームを防ぐ最小サイズ
    padding: '10px 14px',
    borderRadius: '10px',    // 少し角を丸くしてモダンに
    border: '2px solid #eee', // 境界線を少し太く
    outline: 'none',
    backgroundColor: '#f8f9fa',
    transition: 'border-color 0.2s',
  },
  searchButton: {
    fontSize: 14,
    padding: '0 20px',
    borderRadius: '10px',
    border: 'none',
    background: '#4D96FF',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(77, 150, 255, 0.2)', // 軽い影で浮かせる
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 10,
    color: '#888',           // 少し淡くしてタグを引き立てる
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  tagRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 10,
  },
  tag: {
    fontSize: 13,
    fontWeight: 600,
    color: '#4D96FF',
    background: '#fff',
    padding: '6px 14px',
    borderRadius: 999,
    border: '1.5px solid rgba(77, 150, 255, 0.3)', // 塗りより枠線メインでスッキリ
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
}