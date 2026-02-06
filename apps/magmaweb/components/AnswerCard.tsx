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

type ParsedComment =
  | { kind: 'plain'; text: string }
  | { kind: 'question'; question: string; reply?: string }

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

  const icon = (type: Reaction['type']) => {
    if (type === 'star') return <Star size={20} fill="#FFD700" />
    if (type === 'exclamation')
      return <AlertTriangle size={20} fill="#FF4500" />
    return <HelpCircle size={20} fill="#00BFFF" />
  }

  const parseComment = (r: Reaction): ParsedComment | null => {
    if (!r.comment) return null

    if (r.type === 'question') {
      try {
        const json = JSON.parse(r.comment)
        if (json.question) {
          return {
            kind: 'question',
            question: json.question,
            reply: json.reply,
          }
        }
      } catch {
        // フォールバック（旧データ救済）
        return { kind: 'plain', text: r.comment }
      }
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
          <img
            src={image}
            alt="answer"
            style={styles.image}
            draggable={false}
          />

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
                      transition:
                        'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                      filter:
                        'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
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

    {/* comment がない場合（⭐ / ❗） */}
    {!parsed && (
      <div style={styles.bubbleComment}>
        {r.type === 'star' && 'いいね！'}
        {r.type === 'exclamation' && '注目ポイント'}
      </div>
    )}

    {/* 通常コメント */}
    {parsed?.kind === 'plain' && (
      <div style={styles.bubbleComment}>
        {parsed.text}
      </div>
    )}

    {/* 質問 */}
    {parsed?.kind === 'question' && (
      <>
        <div style={styles.questionText}>
          Q. {parsed.question}
        </div>
        {parsed.reply && (
          <div style={styles.replyText}>
            A. {parsed.reply}
          </div>
        )}
      </>
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

const styles: { [key: string]: CSSProperties } = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    padding: '0 16px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    color: '#555',
  },
  user: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  date: {
    marginLeft: 4,
    color: '#aaa',
    fontSize: 11,
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
  },
  image: {
    width: '100%',
    borderRadius: 8,
    border: '1px solid #eee',
    userSelect: 'none',
  },
  reaction: {
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    cursor: 'pointer',
    zIndex: 10,
  },
  toggleButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    zIndex: 20,
  },
  toggleText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 700,
    padding: '4px 8px',
    textShadow: `
      0 1px 2px rgba(0,0,0,0.9),
      0 0 4px rgba(0,0,0,0.6)
    `,
  },
  bubble: {
    position: 'absolute',
    bottom: '140%',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(0,0,0,0.85)',
    color: '#fff',
    padding: '8px 12px',
    borderRadius: 12,
    fontSize: 12,
    minWidth: 160,
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
  reactorName: {
    fontSize: 11,
    fontWeight: 700,
    color: '#ccc',
  },
  bubbleComment: {
    lineHeight: 1.4,
  },
  questionText: {
    fontWeight: 700,
    marginBottom: 4,
  },
  replyText: {
    opacity: 0.85,
  },
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
