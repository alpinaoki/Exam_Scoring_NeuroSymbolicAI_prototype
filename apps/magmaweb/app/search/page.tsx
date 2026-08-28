'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import LayoutShell from '../../components/LayoutShell'
import ProblemFeed from '../../components/ProblemFeed'
import QuestionCard from '../../components/QuestionCard'
import { getQuestionThreads } from '../../lib/posts'
import { COURSE_TAGS, SEASONAL_TAGS, OTHER_TAGS, UNIT_TAGS } from '../../lib/mathTags'

export default function SearchPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'recommend' | 'question'>('recommend')
  const [questionThreads, setQuestionThreads] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // 検索・サジェスト・タグモーダル用ステート
  const [query, setQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showTagModal, setShowTagModal] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // 1. 認証チェック（既存の Feed / SearchPage と同等）
  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.replace('/login')
    })
  }, [router])

  // 2. 質問スレッドの取得（feed/page.tsx のロジックを完全維持）
  useEffect(() => {
    if (tab === 'question') {
      setLoading(true)
      getQuestionThreads()
        .then(data => {
          if (!data) {
            setQuestionThreads([])
            return
          }

          const formatted = data
            .filter((r: any) => r.post && r.post.parent)
            .map((r: any) => ({
              problem: {
                id: r.post.parent.id,
                image_url: r.post.parent.image_url,
                username: r.post.parent.profiles?.handle || 'unknown',
                created_at: r.post.parent.created_at,
                anonymous: r.post.parent.anonymous,
                label: r.post.parent.label
              },
              answer: {
                id: r.post.id,
                image_url: r.post.image_url
              },
              reactions: [{
                id: r.id,
                comment: r.comment,
                username: r.post.profiles?.handle || 'unknown',
                created_at: r.created_at,
                x_float: r.x_float,
                y_float: r.y_float
              }]
            }))

          setQuestionThreads(formatted)
        })
        .catch(err => console.error("Fetch Error:", err))
        .finally(() => setLoading(false))
    }
  }, [tab])

  // 3. サジェスト計算ロジック
  const allTagsForSearch = useMemo(() => {
    return Array.from(new Set([...COURSE_TAGS, ...SEASONAL_TAGS, ...UNIT_TAGS, ...OTHER_TAGS]))
  }, [])

  const filteredSuggestions = useMemo(() => {
    if (!query.trim()) return []
    return allTagsForSearch
      .filter(tag => tag.toLowerCase().includes(query.toLowerCase()) && tag !== query)
      .slice(0, 6)
  }, [query, allTagsForSearch])

  // 既存の search/[id]/page.tsx へそのまま遷移させる関数
  const goTag = (tag: string) => {
    if (!tag.trim()) return
    setQuery(tag)
    setShowSuggestions(false)
    setShowTagModal(false)
    router.push(`/search/${encodeURIComponent(tag.trim())}`)
  }

  // 枠外クリックでサジェスト非表示
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
    <div style={styles.pageWrapper}>
      <LayoutShell>
        {/* 固定ヘッダー（検索バー ＋ タブ切り替え） */}
        <div style={styles.headerSection}>
          <div ref={containerRef} style={styles.searchContainer}>
            <div style={styles.searchBox}>
              <div style={styles.inputWrapper}>
                <Search size={18} style={styles.searchIconLeft} color="#94a3b8" />
                <input
                  type="text"
                  placeholder="タグ・キーワードを入力..."
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

              {/* 検索実行ボタン -> search/[id]/page.tsx へ遷移 */}
              <button style={styles.searchButton} onClick={() => goTag(query)}>
                検索
              </button>

              {/* タグモーダル開閉ボタン */}
              <button 
                style={styles.filterButton} 
                onClick={() => setShowTagModal(true)}
                title="タグ一覧を開く"
              >
                <SlidersHorizontal size={18} color="#2C3E50" />
              </button>
            </div>

            {/* サジェストリスト */}
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div style={styles.suggestionList}>
                {filteredSuggestions.map((tag) => (
                  <div
                    key={tag}
                    style={styles.suggestionItem}
                    onMouseDown={() => goTag(tag)}
                  >
                    <Search size={14} style={{ marginRight: 10 }} color="#94a3b8" />
                    <span style={{ color: '#334155', fontWeight: 500, fontSize: 14 }}>{tag}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* おすすめ / 質問 タブ */}
          <div style={styles.tabBar}>
            <button
              onClick={() => setTab('recommend')}
              style={{ ...styles.tabButton, ...(tab === 'recommend' ? styles.activeTab : {}) }}
            >
              おすすめ
            </button>
            <button
              onClick={() => setTab('question')}
              style={{ ...styles.tabButton, ...(tab === 'question' ? styles.activeTab : {}) }}
            >
              質問
            </button>
          </div>
        </div>

        {/* タイムライン表示エリア */}
        <div style={styles.feedContainer}>
          {tab === 'recommend' && <ProblemFeed />}

          {tab === 'question' && (
            <div style={{ paddingTop: '16px' }}>
              {loading ? (
                <div style={styles.emptyState}>読み込み中...</div>
              ) : questionThreads.length > 0 ? (
                questionThreads.map((data, idx) => (
                  <QuestionCard key={`${data.problem.id}-${idx}`} data={data} />
                ))
              ) : (
                <div style={styles.emptyState}>進行中の質問はありません。</div>
              )}
            </div>
          )}
        </div>

        {/* タグ一覧モーダル（タップで search/[id]/page.tsx へ遷移） */}
        {showTagModal && (
          <div style={styles.modalOverlay} onClick={() => setShowTagModal(false)}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>タグで絞り込み</span>
                <button style={styles.closeBtn} onClick={() => setShowTagModal(false)}>
                  <X size={20} color="#64748b" />
                </button>
              </div>

              <div style={styles.tagScrollArea}>
                <section style={{ marginBottom: 24 }}>
                  <h3 style={styles.sectionTitle}>課程</h3>
                  <div style={styles.tagRow}>
                    {COURSE_TAGS.map((t) => (
                      <button key={t} style={styles.tag} onClick={() => goTag(t)}>
                        #{t}
                      </button>
                    ))}
                  </div>
                </section>

                <section style={{ marginBottom: 24 }}>
                  <h3 style={styles.sectionTitle}>単元</h3>
                  <div style={styles.tagRow}>
                    {UNIT_TAGS.map((t) => (
                      <button key={t} style={styles.tag} onClick={() => goTag(t)}>
                        #{t}
                      </button>
                    ))}
                  </div>
                </section>

                <section style={{ marginBottom: 24 }}>
                  <h3 style={styles.sectionTitle}>期間限定</h3>
                  <div style={styles.tagRow}>
                    {SEASONAL_TAGS.map((t) => (
                      <button key={t} style={styles.tag} onClick={() => goTag(t)}>
                        #{t}
                      </button>
                    ))}
                  </div>
                </section>

                <section>
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
            </div>
          </div>
        )}
      </LayoutShell>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  pageWrapper: {
    backgroundColor: '#f9fafb',
    minHeight: '100vh',
  },
  headerSection: {
    position: 'sticky',
    top: 32,
    zIndex: 500,
    background: '#2C3E50',
    paddingTop: 12,
    borderBottom: '1px solid #3d566e',
  },
  searchContainer: {
    position: 'relative',
    width: '100%',
    maxWidth: 600,
    margin: '0 auto',
    padding: '0 12px',
  },
  searchBox: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
  },
  inputWrapper: {
    position: 'relative',
    flex: 1,
    display: 'flex',
    alignItems: 'center',
  },
  searchIconLeft: {
    position: 'absolute',
    left: 12,
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    fontSize: 14,
    padding: '10px 12px 10px 36px',
    borderRadius: '10px',
    border: 'none',
    outline: 'none',
    backgroundColor: '#ffffff',
    color: '#1e293b',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  searchButton: {
    fontSize: 13,
    padding: '10px 16px',
    borderRadius: '10px',
    border: 'none',
    background: '#4D96FF',
    color: '#fff',
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  filterButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
    width: 38,
    borderRadius: '10px',
    border: 'none',
    background: '#ecf0f1',
    cursor: 'pointer',
    flexShrink: 0,
  },
  suggestionList: {
    position: 'absolute',
    top: '100%',
    left: 12,
    right: 12,
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
    border: '1px solid #e2e8f0',
    marginTop: 6,
    zIndex: 20,
    overflow: 'hidden',
    padding: '4px 0',
  },
  suggestionItem: {
    padding: '10px 14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  tabBar: {
    display: 'flex',
    marginTop: 10,
    maxWidth: 600,
    margin: '10px auto 0 auto',
  },
  tabButton: {
    flex: 1,
    padding: '12px 0',
    background: 'none',
    border: 'none',
    color: '#888',
    fontSize: 15,
    fontWeight: 'bold',
    cursor: 'pointer',
    outline: 'none',
  },
  activeTab: {
    color: '#ffffff',
    borderBottom: '2px solid #00aaff',
  },
  feedContainer: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '0 12px 100px 12px',
  },
  emptyState: {
    height: '60vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#999',
  },

  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    backdropFilter: 'blur(3px)',
    zIndex: 2000,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  modalContent: {
    width: '100%',
    maxWidth: 600,
    maxHeight: '80vh',
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 -10px 30px rgba(0,0,0,0.2)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #f1f5f9',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 4,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagScrollArea: {
    padding: '20px',
    overflowY: 'auto',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 800,
    marginBottom: 12,
    color: '#94a3b8',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
  tagRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    fontSize: 13,
    fontWeight: 600,
    color: '#4D96FF',
    background: '#F0F7FF',
    padding: '8px 14px',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
  },
}