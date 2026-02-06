'use client'

import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import AnswerActionBar from './AnswerActionBar'
import { formatDateTime } from '../lib/time'
import { getReactionsByPostId } from '../lib/posts'
import { supabase } from '../lib/supabase'
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

type ChatMessage = {
  username: string
  content: string
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
  const [showReactions, setShowReactions] = useState(true)
  const [replyText, setReplyText] = useState('')

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

  const parseChat = (comment?: string | null): ChatMessage[] => {
    if (!comment) return []
    try {
      return JSON.parse(comment)
    } catch {
      return []
    }
  }

  const sendReply = async (reaction: Reaction) => {
    if (!replyText.trim()) return

    const chats = parseChat(reaction.comment)

    const next = [
      ...chats,
      {
        username: displayName,
        content: replyText.trim(),
      },
    ]

    await supabase
      .from('reactions')
      .update({
        comment: JSON.stringify(next),
      })
      .eq('id', reaction.id)

    setReactions((prev) =>
      prev.map((r) =>
        r.id === reaction.id
          ? { ...r, comment: JSON.stringify(next) }
          : r
      )
    )

    setReplyText('')
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
            reactions.map((r) => (
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
                    {r.type === 'question' ? (
                      <>
                        <div style={styles.chatList}>
                          {parseChat(r.comment).map((c, i) => (
                            <div key={i} style={styles.chatItem}>
                              <UserBadge username={c.username} size={14} />
                              <div>
                                <div style={styles.chatName}>
                                  @{c.username}
                                </div>
                                <div style={styles.chatContent}>
                                  {c.content}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div style={styles.replyBox}>
                          <input
                            value={replyText}
                            onChange={(e) =>
                              setReplyText(e.target.value)
                            }
                            placeholder="返信を書く…"
                            style={styles.replyInput}
                          />
                          <button
                            style={styles.replyButton}
                            onClick={() => sendReply(r)}
                          >
                            送信
                          </button>
                        </div>
                      </>
                    ) : (
                      r.comment && (
                        <div style={styles.bubbleComment}>
                          {r.comment}
                        </div>
                      )
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
  toggleButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    background: 'transparent',
    border: 'none',
    padding: 0,
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
    borderRadius: '12px',
    fontSize: '12px',
    minWidth: '160px',
    zIndex: 2000,
    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
  },
  bubbleComment: {
    fontWeight: 500,
    lineHeight: '1.4',
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

  /* question専用 */
  chatList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    marginBottom: 8,
  },
  chatItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 6,
  },
  chatName: {
    fontSize: 11,
    fontWeight: 700,
    color: '#ccc',
  },
  chatContent: {
    fontSize: 12,
    lineHeight: '1.4',
  },
  replyBox: {
    display: 'flex',
    gap: 6,
  },
  replyInput: {
    flex: 1,
    fontSize: 12,
    padding: '4px 8px',
    borderRadius: 6,
    border: 'none',
    outline: 'none',
  },
  replyButton: {
    fontSize: 11,
    padding: '4px 8px',
    borderRadius: 6,
    border: 'none',
    cursor: 'pointer',
    background: '#4D96FF',
    color: '#fff',
    fontWeight: 700,
  },
}
