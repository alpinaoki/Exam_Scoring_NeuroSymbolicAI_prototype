'use client'

import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import AnswerActionBar from './AnswerActionBar'
import { formatDateTime } from '../lib/time'
import { getReactionsByPostId } from '../lib/posts'
import UserBadge from './UserBadge'
import { Star, AlertTriangle, HelpCircle } from 'lucide-react'

type Reaction = {
  id: string
  type: 'star' | 'exclamation' | 'question'
  x_float: number
  y_float: number
  comment?: string | null
  username?: string | null
}

type QuestionMessage = {
  username: string
  content: string
}

type ParsedComment =
  | { kind: 'plain'; text: string }
  | { kind: 'question'; messages: QuestionMessage[] }

type Props = {
  image: string | null
  answerId: string
  rootId: string
  username: string
  createdAt: string
  anonymous: boolean
}

export default function AnswerCard({
  image,
  answerId,
  username,
  createdAt,
  anonymous,
}: Props) {
  const router = useRouter()
  const [reactions, setReactions] = useState<Reaction[]>([])
  const [activeReactionId, setActiveReactionId] = useState<string | null>(null)
  const [showReactions, setShowReactions] = useState(true)

  const displayName = anonymous ? 'Anonymous' : username

  useEffect(() => {
    getReactionsByPostId(answerId).then(setReactions)
  }, [answerId])

  /* ✅ アイコン色を完全に元に戻す */
  const icon = (type: Reaction['type']) => {
    if (type === 'star')
      return <Star size={20} color="#FFD700" fill="#FFD700" />
    if (type === 'exclamation')
      return (
        <AlertTriangle size={20} color="#FF4500" fill="#FF4500" />
      )
    return <HelpCircle size={20} color="#00BFFF" />
  }

  /* ✅ typeに依存せず JSON配列なら会話扱い */
  const parseComment = (r: Reaction): ParsedComment | null => {
    if (!r.comment) return null

    try {
      const json = JSON.parse(r.comment)
      if (
        Array.isArray(json) &&
        json.every(
          (m) =>
            typeof m.username === 'string' &&
            typeof m.content === 'string'
        )
      ) {
        return { kind: 'question', messages: json }
      }
    } catch {
      // JSONじゃない → plain
    }

    return { kind: 'plain', text: r.comment }
  }

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div
          style={{ ...styles.user, cursor: anonymous ? 'default' : 'pointer' }}
          onClick={() => !anonymous && router.push(`/profiles/${username}`)}
        >
          <UserBadge username={displayName} />
          <span>@{displayName}</span>
        </div>
        <span style={styles.date}>· {formatDateTime(createdAt)}</span>
      </div>

      {image && (
        <div style={styles.imageWrapper}>
          <img src={image} alt="answer" style={styles.image} />

          {reactions.length > 0 && (
            <button
              style={styles.toggleButton}
              onClick={() => {
                setShowReactions(!showReactions)
                setActiveReactionId(null)
              }}
            >
              <span style={styles.toggleText}>
                {showReactions
                  ? 'リアクションを非表示'
                  : 'リアクションを表示'}
              </span>
            </button>
          )}

          {showReactions &&
            reactions.map((r) => {
              const parsed = parseComment(r)

              return (
                <div
                  key={r.id}
                  style={{
                    ...styles.reaction,
                    left: `${r.x_float * 100}%`,
                    top: `${r.y_float * 100}%`,
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveReactionId(
                      activeReactionId === r.id ? null : r.id
                    )
                  }}
                >
                  <div
                    style={{
                      transform:
                        activeReactionId === r.id
                          ? 'scale(1.4)'
                          : 'scale(1)',
                      transition: 'transform 0.2s ease',
                    }}
                  >
                    {icon(r.type)}
                  </div>

                  {activeReactionId === r.id && (
                    <div style={styles.bubble}>
                      <div style={styles.bubbleHeader}>
                        <UserBadge username={r.username ?? ''} size={14} />
                        <span style={styles.reactorName}>
                          @{r.username ?? 'unknown'}
                        </span>
                      </div>

                      {/* ⭐❗ */}
                      {parsed?.kind === 'plain' && (
                        <div style={styles.bubbleComment}>
                          {parsed.text}
                        </div>
                      )}

                      {/* ❓ 会話 */}
                      {parsed?.kind === 'question' && (
                        <div style={styles.questionThread}>
                          {parsed.messages.map((m, i) => (
                            <div key={i} style={styles.questionRow}>
                              <UserBadge username={m.username} size={14} />
                              <div style={styles.questionBubble}>
                                <div style={styles.questionName}>
                                  @{m.username}
                                </div>
                                <div>{m.content}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div style={styles.bubbleArrow} />
                    </div>
                  )}
                </div>
              )
            })}
        </div>
      )}

      <AnswerActionBar
        answerId={answerId}
        imageUrl={image}
        reactionCount={reactions.length}
      />
    </div>
  )
}

/* styles はそのまま */
const styles: { [key: string]: CSSProperties } = {
  card: { display: 'flex', flexDirection: 'column', gap: 8, padding: '0 16px' },
  header: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 },
  user: { display: 'flex', alignItems: 'center', gap: 6 },
  date: { marginLeft: 4, fontSize: 11, color: '#aaa' },
  imageWrapper: { position: 'relative', width: '100%' },
  image: { width: '100%', borderRadius: 8, border: '1px solid #eee' },
  reaction: { position: 'absolute', transform: 'translate(-50%, -50%)' },
  toggleButton: { position: 'absolute', top: 8, right: 8, border: 'none' },
  toggleText: { color: '#fff', fontSize: 11, fontWeight: 700 },
  bubble: {
    position: 'absolute',
    bottom: '140%',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(0,0,0,0.85)',
    color: '#fff',
    padding: '8px 12px',
    borderRadius: 12,
    minWidth: 180,
    zIndex: 2000,
  },
  bubbleHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
    borderBottom: '1px solid rgba(255,255,255,0.2)',
    paddingBottom: 4,
  },
  reactorName: { fontSize: 11, fontWeight: 700, color: '#ccc' },
  bubbleComment: { lineHeight: 1.4 },
  questionThread: { display: 'flex', flexDirection: 'column', gap: 6 },
  questionRow: { display: 'flex', gap: 6 },
  questionBubble: {
    background: 'rgba(255,255,255,0.12)',
    padding: '6px 8px',
    borderRadius: 8,
  },
  questionName: { fontSize: 10, fontWeight: 700, opacity: 0.7 },
  bubbleArrow: {
    position: 'absolute',
    top: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    borderWidth: 6,
    borderStyle: 'solid',
    borderColor:
      'rgba(0,0,0,0.85) transparent transparent transparent',
  },
}
