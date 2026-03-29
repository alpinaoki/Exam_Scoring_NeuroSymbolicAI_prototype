'use client'

import { createPortal } from 'react-dom'
import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import AnswerActionBar from './AnswerActionBar'
import { formatDateTime } from '../lib/time'
import { getReactionsByPostId, updateReactionComment } from '../lib/posts'
import UserBadge from './UserBadge'
import {
  Star,
  AlertTriangle,
  HelpCircle,
  Send,
  Layers,
} from 'lucide-react'

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
  const [activeReactionId, setActiveReactionId] =
    useState<string | null>(null)

  const [replyText, setReplyText] = useState('')
  const [showReactions, setShowReactions] = useState(true)
  const [openThread, setOpenThread] = useState<Reaction | null>(null)

  const displayName = anonymous ? 'Anonymous' : username

  useEffect(() => {
    getReactionsByPostId(answerId).then(setReactions)
  }, [answerId])

  const icon = (type: Reaction['type']) => {
    const iconSize = 16
    const strokeColor = '#444'
    const strokeWidth = 1.2

    if (type === 'star')
      return <Star size={iconSize} fill="#FFE066" stroke={strokeColor} strokeWidth={strokeWidth} />
    if (type === 'exclamation')
      return <AlertTriangle size={iconSize} fill="#FFAD99" stroke={strokeColor} strokeWidth={strokeWidth} />
    return <HelpCircle size={iconSize} fill="#99E6FF" stroke={strokeColor} strokeWidth={strokeWidth} />
  }

  const parseQuestion = (r: Reaction): QuestionMessage[] | null => {
    if (r.type !== 'question' || !r.comment) return null
    try {
      const json = JSON.parse(r.comment)
      if (
        Array.isArray(json) &&
        json.every(
          (m) =>
            typeof m.username === 'string' &&
            typeof m.content === 'string'
        )
      )
        return json
      return null
    } catch {
      return null
    }
  }

  const sendReply = async (
    r: Reaction,
    messages: QuestionMessage[]
  ) => {
    if (!replyText.trim()) return

    const next = [
      ...messages,
      { username: displayName, content: replyText },
    ]
    const json = JSON.stringify(next)

    setReactions((prev) =>
      prev.map((rx) =>
        rx.id === r.id ? { ...rx, comment: json } : rx
      )
    )

    setReplyText('')
    await updateReactionComment(r.id, json)
  }

  return (
    <>
      <div style={styles.card}>
        <div style={styles.header}>
          <div
            style={{ ...styles.user, cursor: anonymous ? 'default' : 'pointer' }}
            onClick={() => !anonymous && router.push(`/profiles/${username}`)}
          >
            <UserBadge username={displayName} />
            <span style={styles.usernameText}>@{displayName}</span>
          </div>
          <span style={styles.date}>· {formatDateTime(createdAt)}</span>
        </div>

        {image && (
          <div style={styles.imageSection}>
            {/* ✅ 外クリックで閉じる */}
            <div
              style={styles.imageWrapper}
              onClick={() => setActiveReactionId(null)}
            >
              <img src={image} alt="answer" style={styles.image} draggable={false} />

              {showReactions &&
                reactions.map((r) => {
                  const isActive = activeReactionId === r.id

                  return (
                    <div
                      key={r.id}
                      style={{
                        ...styles.reaction,
                        left: `${r.x_float * 100}%`,
                        top: `${r.y_float * 100}%`,
                        zIndex: isActive ? 999 : 10, // ✅ 最前面
                      }}
                    >
                      <div
                        onClick={(e) => {
                          e.stopPropagation()
                          if (r.type === 'question') {
                            setOpenThread(r)
                            return
                          }
                          setActiveReactionId(isActive ? null : r.id)
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        {icon(r.type)}
                      </div>

                      {isActive && r.type !== 'question' && (
                        <div style={styles.bubble}>
                          <div style={styles.bubbleHeader}>
                            <UserBadge username={r.username ?? ''} size={14} />
                            <span>@{r.username ?? 'unknown'}</span>
                          </div>
                          <div style={styles.bubbleContent}>{r.comment ?? ''}</div>
                          <div style={styles.bubbleArrow} />
                        </div>
                      )}
                    </div>
                  )
                })}
            </div>

            <button
              style={{
                ...styles.toggleButton,
                color: showReactions ? '#4D96FF' : '#bbb',
                borderColor: showReactions ? '#4D96FF44' : '#eee',
              }}
              onClick={() => setShowReactions((prev) => !prev)}
            >
              <Layers size={18} />
            </button>
          </div>
        )}

        <AnswerActionBar
          answerId={answerId}
          imageUrl={image}
          reactionCount={reactions.length}
          username={username}
        />
      </div>

      {openThread && (
        <ThreadModal
          reaction={openThread}
          onClose={() => setOpenThread(null)}
          replyText={replyText}
          setReplyText={setReplyText}
          sendReply={sendReply}
          parseQuestion={parseQuestion}
        />
      )}
    </>
  )
}

/* ===================== */
/* Thread Modal */
/* ===================== */

function ThreadModal({
  reaction,
  onClose,
  replyText,
  setReplyText,
  sendReply,
  parseQuestion,
}: any) {
  const messages = parseQuestion(reaction) ?? []
  const [localMessages, setLocalMessages] = useState(messages)
  const startY = useRef<number | null>(null)
  const [mounted, setMounted] = useState(false)

  // ✅ 初期高さ下げた
  const [height, setHeight] = useState('55dvh')
  const [translateY, setTranslateY] = useState(0)

  useEffect(() => {
    setMounted(true)

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [])

  if (!mounted) return null

  return createPortal(
    <div style={modalStyles.overlay} onClick={onClose}>
      <div
        style={{
          ...modalStyles.sheet,
          height,
          transform: `translateY(${translateY}px)`,
        }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => {
          startY.current = e.touches[0].clientY
        }}
        onTouchMove={(e) => {
          if (!startY.current) return
          const diff = e.touches[0].clientY - startY.current
          if (diff > 0) setTranslateY(diff)
        }}
        onTouchEnd={(e) => {
          if (!startY.current) return
          const diff = e.changedTouches[0].clientY - startY.current

          if (diff > 100) onClose()
          else setTranslateY(0)

          startY.current = null
        }}
      >
        <div style={modalStyles.handle} />

        <div style={modalStyles.thread}>
          {localMessages.map((m: any, i: number) => (
            <div key={i} style={modalStyles.row}>
              {/* ✅ ユーザー名を外へ */}
              <div style={modalStyles.userLine}>
                <UserBadge username={m.username} size={20} />
                <span>@{m.username}</span>
              </div>

              <div style={modalStyles.bubble}>
                <div style={modalStyles.content}>{m.content}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={modalStyles.inputArea}>
          <input
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="返信..."
            style={modalStyles.input}
          />
          <button
            onClick={() => {
              if (!replyText.trim()) return

              const newMessage = {
                username: 'you',
                content: replyText,
              }

              const next = [...localMessages, newMessage]
              setLocalMessages(next)

              sendReply(reaction, next)

              setReplyText('')
            }}
            style={modalStyles.send}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

/* ===================== */
/* styles */
/* ===================== */

const styles: { [key: string]: CSSProperties } = {
  card: { display: 'flex', flexDirection: 'column', gap: 12, padding: '16px', background: '#fff', borderRadius: '20px', border: '1px solid #f0f0f0' },
  header: { display: 'flex', alignItems: 'center', gap: 6 },
  user: { display: 'flex', alignItems: 'center', gap: 8 },
  usernameText: { fontWeight: 700 },
  date: { fontSize: 11 },
  imageSection: { position: 'relative' },
  imageWrapper: { position: 'relative' },
  image: { width: '100%' },
  toggleButton: { alignSelf: 'flex-end' },
  reaction: { position: 'absolute', transform: 'translate(-50%, -50%)' },
  bubble: { position: 'absolute', bottom: '160%', left: '50%', transform: 'translateX(-50%)', background: 'black', color: 'white', padding: 8 },
}

const modalStyles: { [key: string]: CSSProperties } = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)' },
  sheet: { position: 'fixed', bottom: 0, width: '100%', background: '#fff', display: 'flex', flexDirection: 'column' },
  handle: { width: 40, height: 5, background: '#eee', alignSelf: 'center', margin: 12 },
  thread: { flex: 1, overflowY: 'auto', padding: 20 },
  row: { display: 'flex', flexDirection: 'column', gap: 4 },
  userLine: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#666' },
  bubble: { background: '#f5f7fa', padding: 12, borderRadius: 12 },
  content: { fontSize: 16 },
  inputArea: { display: 'flex', padding: 16 },
  input: { flex: 1 },
  send: { width: 40, height: 40 },
}