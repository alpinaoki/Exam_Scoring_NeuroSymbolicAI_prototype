'use client'

import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import AnswerActionBar from './AnswerActionBar'
import { formatDateTime } from '../lib/time'
import { getReactionsByPostId } from '../lib/posts'
import UserBadge from './UserBadge'
import { Star, AlertTriangle, HelpCircle } from 'lucide-react'

type ReactionType = 'star' | 'exclamation' | 'question'

type Reaction = {
  id: string
  type: ReactionType
  comment: string | null
  x_float: number
  y_float: number
  username?: string
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

  const getIcon = (type: ReactionType, size = 22) => {
    if (type === 'star') return <Star size={size} fill="#FFD700" />
    if (type === 'exclamation') return <AlertTriangle size={size} fill="#FF4500" />
    return <HelpCircle size={size} fill="#00BFFF" />
  }

  return (
    <div style={styles.card}>
      {/* header */}
      <div style={styles.header}>
        <div
          style={{
            ...styles.user,
            cursor: anonymous ? 'default' : 'pointer',
          }}
          onClick={() => !anonymous && router.push(`/profiles/${username}`)}
        >
          <UserBadge username={displayName} />
          <span style={styles.usernameText}>@{displayName}</span>
        </div>
        <span style={styles.date}>· {formatDateTime(createdAt)}</span>
      </div>

      {/* image + reactions */}
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
                ...styles.reactionContainer,
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
                    activeReactionId === r.id ? 'scale(1.4)' : 'scale(1)',
                  transition: 'transform 0.2s cubic-bezier(0.175,0.885,0.32,1.275)',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                }}
              >
                {getIcon(r.type)}
              </div>

              {activeReactionId === r.id && (
                <div style={styles.bubble}>
                  <div style={styles.bubbleHeader}>
                    <UserBadge username={r.username || ''} size={14} />
                    <span style={styles.reactorName}>
                      @{r.username}
                    </span>
                  </div>
                  <div style={styles.bubbleComment}>
                    {r.comment}
                  </div>
                  <div style={styles.bubbleArrow} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* footer */}
      <div style={styles.footer}>
        <AnswerActionBar
          problemId={answerId}
          reactionCount={reactions.length}
          imageUrl={image}
        />
      </div>
    </div>
  )
}

const styles: { [key: string]: CSSProperties } = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    padding: 16,
    background: '#fff',
    borderRadius: 16,
    border: '1px solid #eee',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
  },
  user: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  usernameText: {
    fontWeight: 600,
    color: '#333',
  },
  date: {
    color: '#aaa',
    fontSize: 11,
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    borderRadius: 12,
  },
  image: {
    width: '100%',
    borderRadius: 12,
    userSelect: 'none',
  },
  reactionContainer: {
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    cursor: 'pointer',
    zIndex: 10,
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
    minWidth: 120,
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
    fontSize: 11,
    fontWeight: 700,
    color: '#ccc',
  },
  bubbleComment: {
    fontWeight: 500,
    lineHeight: 1.4,
    wordBreak: 'break-word',
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
  footer: {
    marginTop: 4,
  },
}
