'use client'

import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import AnswerActionBar from './AnswerActionBar'
import ReactionIcon from './ReactionIcon'
import { formatDateTime } from '../lib/time'
import { getReactionsByPostId } from '../lib/posts'
import UserBadge from './UserBadge'

type Reaction = {
  id: string
  type: string
  comment: string | null
  x_float: number
  y_float: number
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
  const timeLabel = formatDateTime(createdAt)

  const [reactions, setReactions] = useState<Reaction[]>([])
  const [activeReactionId, setActiveReactionId] = useState<string | null>(null)

  const displayName = anonymous ? 'Anonymous' : username

  useEffect(() => {
    getReactionsByPostId(answerId).then(setReactions)
  }, [answerId])

  const goProfile = () => {
    if (anonymous) return
    router.push(`/profiles/${username}`)
  }

  // アイコンの中身を塗りつぶす色
  const getReactionColor = (type: string) => {
    switch (type) {
      case 'star': return '#FFD700'
      case 'exclamation': return '#FF4500'
      case 'question': return '#00BFFF'
      default: return '#eee'
    }
  }

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div
          style={{
            ...styles.user,
            cursor: anonymous ? 'default' : 'pointer',
          }}
          onClick={goProfile}
        >
          <UserBadge username={displayName} />
          <span style={styles.usernameText}>@{displayName}</span>
        </div>
        <span style={styles.date}>· {timeLabel}</span>
      </div>

      {image && (
        <div style={styles.imageWrapper}>
          <img src={image} alt="answer" style={styles.image} />

          {reactions.map((r) => {
            const isActive = activeReactionId === r.id
            const themeColor = getReactionColor(r.type)

            return (
              <div
                key={r.id}
                style={{
                  ...styles.reactionContainer,
                  left: `${r.x_float * 100}%`,
                  top: `${r.y_float * 100}%`,
                }}
                onClick={() => setActiveReactionId(isActive ? null : r.id)}
              >
                {/* マルを削除し、アイコン自体にスタイルを適用 */}
                <div style={{
                  display: 'flex',
                  transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  transform: isActive ? 'scale(1.5) translateY(-5px)' : 'scale(1)',
                  filter: `drop-shadow(0 2px 4px rgba(0,0,0,0.5)) ${isActive ? `drop-shadow(0 0 8px ${themeColor})` : ''}`,
                }}>
                  <ReactionIcon 
                    type={r.type} 
                    size={22} // 枠がなくなった分、少し大きくして視認性を確保
                    color="#000" 
                    fillColor={themeColor} 
                  />
                </div>

                {isActive && r.comment && (
                  <div style={styles.bubble}>
                    {r.comment}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <div style={styles.footer}>
        <AnswerActionBar
          problemId={answerId}
          reactionCount={reactions.length}
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
    padding: '16px',
    background: '#fff',
    borderRadius: '16px',
    border: '1px solid #f0f0f0',
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
    marginLeft: 4,
    color: '#aaa',
    fontSize: 11,
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    lineHeight: 0,
  },
  image: {
    width: '100%',
    borderRadius: '12px',
    border: '1px solid #eee',
  },
  reactionContainer: {
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    cursor: 'pointer',
    zIndex: 5,
    padding: '15px', // クリックエリアを広めに
  },
  bubble: {
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    transform: 'translateX(-50%) translateY(-10px)',
    background: 'rgba(0,0,0,0.9)',
    borderRadius: '8px',
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#fff',
    whiteSpace: 'nowrap',
    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
    zIndex: 10,
    pointerEvents: 'none',
  },
  footer: {
    marginTop: 4,
  }
}