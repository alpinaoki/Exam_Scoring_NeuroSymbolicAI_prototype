'use client'

import { useRouter } from 'next/navigation'
import { COURSE_TAGS, UNIT_TAGS } from '../../../lib/mathTags'

export default function SearchPage() {
  const router = useRouter()

  const goTag = (tag: string) => {
    router.push(`/search/${encodeURIComponent(tag)}`)
  }

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700 }}>
        検索
      </h2>

      {/* 課程タグ */}
      <section style={{ marginTop: 16 }}>
        <h3 style={styles.sectionTitle}>課程</h3>
        <div style={styles.tagRow}>
          {COURSE_TAGS.map((t) => (
            <button
              key={t}
              style={styles.tag}
              onClick={() => goTag(t)}
            >
              #{t}
            </button>
          ))}
        </div>
      </section>

      {/* 単元タグ */}
      <section style={{ marginTop: 24 }}>
        <h3 style={styles.sectionTitle}>単元</h3>
        <div style={styles.tagRow}>
          {UNIT_TAGS.map((t) => (
            <button
              key={t}
              style={styles.tag}
              onClick={() => goTag(t)}
            >
              #{t}
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 8,
    color: '#555',
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
    background: 'rgba(77, 150, 255, 0.12)',
    padding: '6px 12px',
    borderRadius: 999,
    border: 'none',
    cursor: 'pointer',
  },
}
