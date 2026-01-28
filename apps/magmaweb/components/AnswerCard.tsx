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

          {reactions.map((r) => (
            <div
              key={r.id}
              style={{
                ...styles.reaction,
                left: `${r.x_float * 100}%`,
                top: `${r.y_float * 100}%`,
                pointerEvents: 'auto',
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
                    activeReactionId === r.id ? 'scale(1.4)' : 'scale(1)',
                  transition:
                    'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
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
                  {r.comment && (
                    <div style={styles.bubbleComment}>{r.comment}</div>
                  )}
                  <div style={styles.bubbleArrow} />
                </div>
              )}
            </div>
          ))}
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

  /* ↓ 追加分（表示用） */
  bubble: {
    position: 'absolute',
    bottom: '140%',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(0,0,0,0.85)',
    color: '#fff',
    padding: '8px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    minWidth: '120px',
    zIndex: 2000,
    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
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
    fontSize: '11px',
    fontWeight: 700,
    color: '#ccc',
  },
  bubbleComment: {
    fontWeight: 500,
    lineHeight: '1.4',
    whiteSpace: 'normal',
    wordBreak: 'break-word',
  },
  bubbleArrow: {
    position: 'absolute',
    top: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    borderWidth: '6px',
    borderStyle: 'solid',
    borderColor:
      'rgba(0,0,0,0.85) transparent transparent transparent',
  },
}
