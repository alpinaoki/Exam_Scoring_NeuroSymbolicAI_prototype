'use client'

import { useRouter } from 'next/navigation'
import { useState, useMemo, useRef, useEffect } from 'react'
import { Search } from 'lucide-react'
import { COURSE_TAGS, SEASONAL_TAGS, OTHER_TAGS, UNIT_TAGS } from '../../lib/mathTags'

export default function SearchPage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // サジェスト計算用（表示はしないが検索候補として利用）
  const allTagsForSearch = useMemo(() => {
    return Array.from(new Set([...COURSE_TAGS, ...SEASONAL_TAGS, ...UNIT_TAGS, ...OTHER_TAGS]))
  }, [])

  const filteredSuggestions = useMemo(() => {
    if (!query.trim()) return []
    return allTagsForSearch
      .filter(tag => tag.toLowerCase().includes(query.toLowerCase()) && tag !== query)
      .slice(0, 6)
  }, [query, allTagsForSearch])

  const goTag = (tag: string) => {
    if (!tag.trim()) return
    setQuery(tag)
    setShowSuggestions(false)
    router.push(`/search/${encodeURIComponent(tag.trim())}`)
  }

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
    <div style={{ padding: '24px 16px', maxWidth: 600, margin: '0 auto' }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20, color: '#333' }}>検索</h2>

      <div ref={containerRef} style={{ position: 'relative' }}>
        <div style={styles.searchBox}>
          <div style={styles.inputWrapper}>
            <Search size={18} style={styles.searchIconLeft} color="#999" />
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
          </div>
          <button style={styles.searchButton} onClick={() => goTag(query)}>
            検索
          </button>
        </div>

        {showSuggestions && filteredSuggestions.length > 0 && (
          <div style={styles.suggestionList}>
            {filteredSuggestions.map((tag) => (
              <div
                key={tag}
                style={styles.suggestionItem}
                onMouseDown={() => goTag(tag)}
              >
                <Search size={14} style={{ marginRight: 12 }} color="#bbb" />
                <span style={{ color: '#444', fontWeight: 500 }}>{tag}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 課程タグ：lib/mathTagsのまま */}
      <section style={{ marginTop: 32 }}>
        <h3 style={styles.sectionTitle}>課程</h3>
        <div style={styles.tagRow}>
          {COURSE_TAGS.map((t) => (
            <button key={t} style={styles.tag} onClick={() => goTag(t)}>
              #{t}
            </button>
          ))}
        </div>
      </section>

      {/* 単元タグ：lib/mathTagsのまま */}
      <section style={{ marginTop: 32 }}>
        <h3 style={styles.sectionTitle}>単元</h3>
        <div style={styles.tagRow}>
          {UNIT_TAGS.map((t) => (
            <button key={t} style={styles.tag} onClick={() => goTag(t)}>
              #{t}
            </button>
          ))}
        </div>
      </section>

{/* 期間限定：lib/mathTagsのまま */}
      <section style={{ marginTop: 32 }}>
        <h3 style={styles.sectionTitle}>その他</h3>
        <div style={styles.tagRow}>
          {SEASONAL_TAGS.map((t) => (
            <button key={t} style={styles.tag} onClick={() => goTag(t)}>
              #{t}
            </button>
          ))}
        </div>

      {/* その他：lib/mathTagsのまま */}
      <section style={{ marginTop: 32 }}>
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
    gap: 10,
    position: 'relative',
    zIndex: 10,
  },
  inputWrapper: {
    position: 'relative',
    flex: 1,
    display: 'flex',
    alignItems: 'center',
  },
  searchIconLeft: {
    position: 'absolute',
    left: 14,
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    fontSize: 16,
    padding: '12px 16px 12px 42px',
    borderRadius: '14px',
    border: '1px solid #e0e0e0',
    outline: 'none',
    backgroundColor: '#fff',
    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
  },
  searchButton: {
    fontSize: 14,
    padding: '0 22px',
    borderRadius: '14px',
    border: 'none',
    background: '#4D96FF',
    color: '#fff',
    fontWeight: 700,
    cursor: 'pointer',
  },
  suggestionList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: '14px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
    border: '1px solid #f0f0f0',
    marginTop: 8,
    zIndex: 20,
    overflow: 'hidden',
    padding: '4px 0',
  },
  suggestionItem: {
    padding: '12px 16px',
    fontSize: 15,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  sectionTitle: { 
    fontSize: 12, 
    fontWeight: 800, 
    marginBottom: 12, 
    color: '#aaa', 
    letterSpacing: '0.1em'
  },
  tagRow: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  tag: {
    fontSize: 13,
    fontWeight: 600,
    color: '#4D96FF',
    background: '#F0F7FF',
    padding: '8px 16px',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
  },
}