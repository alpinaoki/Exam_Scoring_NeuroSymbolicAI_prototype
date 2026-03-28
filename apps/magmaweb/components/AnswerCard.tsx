'use client'

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

  // ★ 修正：アイコンのサイズダウンと色味をパステル調に調整
  const icon = (type: Reaction['type']) => {
    const iconSize = 16 // 20から16へ縮小
    const strokeColor = '#444' // 真っ黒から濃いグレーへ
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
            <div style={styles.imageWrapper}>
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

            {/* ★ 修正：トグルボタンをデザインに馴染むアイコンに変更 */}
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
/* ★ Thread Modal */
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
  const startY = useRef<number | null>(null)

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div
        style={modalStyles.sheet}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => {
          startY.current = e.touches[0].clientY
        }}
        onTouchEnd={(e) => {
          if (!startY.current) return
          const diff = e.changedTouches[0].clientY - startY.current
          if (diff > 80) onClose()
        }}
      >
        <div style={modalStyles.handle} />

        <div style={modalStyles.thread}>
          {messages.map((m: any, i: number) => (
            <div key={i} style={modalStyles.row}>
              <UserBadge username={m.username} size={20} />
              <div style={modalStyles.bubble}>
                <div style={modalStyles.name}>@{m.username}</div>
                <div style={modalStyles.content}>{m.content}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={modalStyles.inputArea}>
          <input
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="返信を書く"
            style={modalStyles.input}
          />
          <button
            onClick={() => sendReply(reaction, messages)}
            style={modalStyles.send}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

/* ===================== */
/* styles */
/* ===================== */

const styles: { [key: string]: CSSProperties } = {
  card: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: 12, 
    padding: '16px',
    background: '#fff',
    borderRadius: '20px',
    border: '1px solid #f0f0f0',
    boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
  },
  header: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 },
  user: { display: 'flex', alignItems: 'center', gap: 8 },
  usernameText: { fontWeight: 700, color: '#333' },
  date: { fontSize: 11, color: '#bbb' },
  
  imageSection: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  imageWrapper: { 
    position: 'relative',
    width: '100%',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid #f5f5f5',
  },
  image: { width: '100%', display: 'block', borderRadius: 0 },
  
  toggleButton: {
    alignSelf: 'flex-end',
    background: '#fff',
    border: '1px solid',
    borderRadius: '10px',
    padding: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
  },
  
  reaction: {
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    zIndex: 10,
  },
  bubble: {
    position: 'absolute',
    bottom: '160%',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(0,0,0,0.8)',
    color: '#fff',
    padding: '8px 12px',
    borderRadius: '10px',
    fontSize: '12px',
    whiteSpace: 'nowrap',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    zIndex: 20,
  },
  bubbleHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
    fontSize: '11px',
    opacity: 0.8,
  },
  bubbleContent: {
    lineHeight: '1.4',
  },
  bubbleArrow: {
    position: 'absolute',
    top: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    borderWidth: '6px',
    borderStyle: 'solid',
    borderColor: 'rgba(0,0,0,0.8) transparent transparent transparent',
  }
}

const modalStyles: { [key: string]: CSSProperties } = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.4)',
    zIndex: 9999,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '80%',
    background: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 -10px 30px rgba(0,0,0,0.1)',
  },
  handle: {
    width: 40,
    height: 5,
    background: '#eee',
    borderRadius: 2.5,
    alignSelf: 'center',
    margin: '12px 0',
  },
  thread: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  row: {
    display: 'flex',
    gap: 12,
    alignItems: 'flex-start',
  },
  bubble: {
    background: '#f5f7fa',
    padding: '12px 16px',
    borderRadius: '16px',
    borderTopLeftRadius: '4px',
    flex: 1,
  },
  name: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
  },
  content: {
    fontSize: 15,
    color: '#333',
    lineHeight: 1.5,
  },
  inputArea: {
    display: 'flex',
    padding: '16px',
    borderTop: '1px solid #f0f0f0',
    background: '#fff',
    alignItems: 'center',
    gap: 12,
  },
  input: {
    flex: 1,
    padding: '12px 18px',
    borderRadius: '24px',
    border: '1px solid #eee',
    background: '#f9f9f9',
    fontSize: '15px',
    outline: 'none',
  },
  send: {
    background: '#4D96FF',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: '42px',
    height: '42px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'transform 0.1s',
  },
}