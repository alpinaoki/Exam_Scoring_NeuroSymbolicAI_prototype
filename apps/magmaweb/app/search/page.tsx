'use client'

import { useRouter } from 'next/navigation'
import { useState, useMemo, useRef, useEffect } from 'react'
import { COURSE_TAGS, OTHER_TAGS, UNIT_TAGS } from '../../lib/mathTags'

export default function SearchPage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const allTags = useMemo(() => {
    return Array.from(new Set([...COURSE_TAGS, ...UNIT_TAGS, ...OTHER_TAGS]))
  }, [])

  // 入力にマッチする候補を最大5件だけ抽出
  const filteredSuggestions = useMemo(() => {
    if (!query.trim()) return []
    return allTags
      .filter(tag => tag.toLowerCase().includes(query.toLowerCase()) && tag !== query)
      .slice(0, 5) // Googleのように数件に絞る
  }, [query, allTags])

  const goTag = (tag: string) => {
    if (!tag.trim()) return
    setQuery(tag)
    setShowSuggestions(false)
    router.push(`/search/${encodeURIComponent(tag.trim())}`)
  }

  // 外側クリックでサジェストを閉じる
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div style={{ padding: 16, maxWidth: 600, margin: '0 auto' }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>検索</h2>

      <div ref={containerRef} style={{ position: 'relative' }}>
        <div style={styles.searchBox}>
          <input
            type="text"
            placeholder="タグ・キーワードを入力"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setShowSuggestions(true)
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') goTag(query)
            }}
            style={styles.input}
          />
          <button style={styles.searchButton} onClick={() => goTag(query)}>
            検索
          </button>
        </div>

        {/* Google検索風の予測サジェスト */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div style={styles.suggestionList}>
            {filteredSuggestions.map((tag) => (
              <div
                key={tag}
                style={styles.suggestionItem}
                onMouseDown={() => goTag(tag)} // onClickだとBlurが先に走るのでMouseDown
              >
                <span style={{ color: '#888', marginRight: 8 }}>🔍</span>
                {tag}
              </div>
            ))}
          </div>
        )}
      </div>

      <section style={{ marginTop: 32 }}>
        <h3 style={styles.sectionTitle}>コース・単元</h3>
        <div style={styles.tagRow}>
          {[...COURSE_TAGS, ...UNIT_TAGS.slice(0, 8)].map((t) => (
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
    zIndex: 10,
  },
  input: {
    flex: 1,
    fontSize: 16, // iOSズーム防止
    padding: '12px 16px',
    borderRadius: '12px',
    border: '2px solid #4D96FF', // 検索を主役にするために少し強調
    outline: 'none',
    backgroundColor: '#fff',
  },
  searchButton: {
    fontSize: 14,
    padding: '0 18px',
    borderRadius: '12px',
    border: 'none',
    background: '#4D96FF',
    color: '#fff',
    fontWeight: 600,
  },
  suggestionList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: '0 0 12px 12px',
    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
    border: '1px solid #eee',
    borderTop: 'none',
    marginTop: -4, // 入力欄と繋がっているように見せる
    zIndex: 5,
    overflow: 'hidden',
  },
  suggestionItem: {
    padding: '12px 16px',
    fontSize: 15,
    cursor: 'pointer',
    borderBottom: '1px solid #f9f9f9',
    display: 'flex',
    alignItems: 'center',
    transition: 'background 0.2s',
  },
  sectionTitle: { fontSize: 13, fontWeight: 700, marginBottom: 12, color: '#aaa' },
  tagRow: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  tag: {
    fontSize: 13,
    fontWeight: 600,
    color: '#4D96FF',
    background: '#fff',
    padding: '6px 14px',
    borderRadius: 999,
    border: '1px solid #4D96FF22',
  },
}