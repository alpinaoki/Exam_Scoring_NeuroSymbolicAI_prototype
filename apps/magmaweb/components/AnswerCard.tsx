'use client'

import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import AnswerActionBar from './AnswerActionBar'
import { formatDateTime } from '../lib/time'
import { getReactionsByPostId, updateReactionComment } from '../lib/posts'
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
  const [replyText, setReplyText] = useState('')
  const bubbleRef = useRef<HTMLDivElement | null>(null)
  const [bubbleShift, setBubbleShift] = useState(0)

  const displayName = anonymous ? 'Anonymous' : username

  useEffect(() => {
    getReactionsByPostId(answerId).then(setReactions)
  }, [answerId])

  useEffect(() => {
    if (!bubbleRef.current) return
    const rect = bubbleRef.current.getBoundingClientRect()
    const margin = 8

    if (rect.left < margin) setBubbleShift(margin - rect.left)
    else if (rect.right > window.innerWidth - margin)
      setBubbleShift(window.innerWidth - margin - rect.right)
    else setBubbleShift(0)
  }, [activeReactionId])

  const icon = (type: Reaction['type']) => {
    if (type === 'star')
      return <Star size={20} fill="#FFD700" stroke="#000" strokeWidth={1.5} />
    if (type === 'exclamation')
      return (
        <AlertTriangle size={20} fill="#FF4500" stroke="#000" strokeWidth={1.5} />
      )
    return (
      <HelpCircle size={20} fill="#00BFFF" stroke="#000" strokeWidth={1.5} />
    )
  }

  const parseComment = (r: Reaction): ParsedComment | null => {
    if (!r.comment) return null

    if (r.type === 'question') {
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
        return null
      } catch {
        return null
      }
    }

    return { kind: 'plain', text: r.comment }
  }

  const sendReply = async (r: Reaction, messages: QuestionMessage[]) => {
    if (!replyText.trim()) return

    const nextMessages = [
      ...messages,
      { username: displayName, content: replyText },
    ]

    const json = JSON.stringify(nextMessages)

    // 楽観的更新
    setReactions((prev) =>
      prev.map((rx) =>
        rx.id === r.id ? { ...rx, comment: json } : rx
      )
    )

    setReplyText('')
    await updateReactionComment(r.id, json)
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
          <img src={image} alt="answer" style={styles.image} draggable={false} />

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
                  {icon(r.type)}

                  {activeReactionId === r.id && (
                    <div
                      ref={bubbleRef}
                      style={{
                        ...styles.bubble,
                        transform: `translateX(calc(-50% + ${bubbleShift}px))`,
                      }}
                    >
                      {parsed?.kind === 'question' && (
                        <>
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

                          <div style={styles.replyBox}>
                            <input
                              style={styles.replyInput}
                              value={replyText}
                              onChange={(e) =>
                                setReplyText(e.target.value)
                              }
                              placeholder="返信を書く"
                            />
                            <button
                              style={styles.replyButton}
                              onClick={() =>
                                sendReply(r, parsed.messages)
                              }
                            >
                              送信
                            </button>
                          </div>
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
  bubble: {
    position: 'absolute',
    bottom: '140%',
    left: '50%',
    background: 'rgba(0,0,0,0.85)',
    color: '#fff',
    padding: '8px 12px',
    borderRadius: 12,
    fontSize: 12,
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
  reactorName: {
    fontSize: 11,
    fontWeight: 700,
    color: '#ccc',
  },
  bubbleComment: {
    lineHeight: 1.4,
  },
  questionThread: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  questionRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 6,
  },
  questionBubble: {
    background: 'rgba(255,255,255,0.12)',
    padding: '6px 8px',
    borderRadius: 8,
  },
  questionName: {
    fontSize: 10,
    fontWeight: 700,
    opacity: 0.7,
    marginBottom: 2,
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
  replyBox: {
    display: 'flex',
    gap: 6,
    marginTop: 8,
  },
  replyInput: {
    flex: 1,
    fontSize: 12,
    padding: '4px 6px',
    borderRadius: 6,
    border: 'none',
  },
  replyButton: {
    fontSize: 12,
    padding: '4px 8px',
    borderRadius: 6,
    border: 'none',
    cursor: 'pointer',
  },
}
