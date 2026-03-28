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
  Eye,
  EyeOff,
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

  // ★ 追加：スレッド用
  const [openThread, setOpenThread] = useState<Reaction | null>(null)

  const displayName = anonymous ? 'Anonymous' : username

  useEffect(() => {
    getReactionsByPostId(answerId).then(setReactions)
  }, [answerId])

  const icon = (type: Reaction['type']) => {
    if (type === 'star')
      return <Star size={20} fill="#FFD700" stroke="#000" strokeWidth={1.5} />
    if (type === 'exclamation')
      return <AlertTriangle size={20} fill="#FF4500" stroke="#000" strokeWidth={1.5} />
    return <HelpCircle size={20} fill="#00BFFF" stroke="#000" strokeWidth={1.5} />
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
            <span>@{displayName}</span>
          </div>
          <span style={styles.date}>· {formatDateTime(createdAt)}</span>
        </div>

        {image && (
          <div style={styles.imageWrapper}>
            <img src={image} alt="answer" style={styles.image} draggable={false} />

            <button
              style={styles.toggleButton}
              onClick={() => setShowReactions((prev) => !prev)}
            >
              {showReactions ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>

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

                        // ★ questionだけ別処理
                        if (r.type === 'question') {
                          setOpenThread(r)
                          return
                        }

                        setActiveReactionId(isActive ? null : r.id)
                      }}
                    >
                      {icon(r.type)}
                    </div>

                    {/* ★ 従来バブルは question以外のみ */}
                    {isActive && r.type !== 'question' && (
                      <div style={styles.bubble}>
                        <div style={styles.bubbleHeader}>
                          <UserBadge username={r.username ?? ''} size={14} />
                          <span>@{r.username ?? 'unknown'}</span>
                        </div>
                        <div>{r.comment ?? ''}</div>
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
          username={username}
        />
      </div>

      {/* ★ フルスクリーンスレッド */}
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
    <div style={modalStyles.overlay}>
      <div
        style={modalStyles.sheet}
        onTouchStart={(e) => {
          startY.current = e.touches[0].clientY
        }}
        onTouchEnd={(e) => {
          if (!startY.current) return
          const diff = e.changedTouches[0].clientY - startY.current
          if (diff > 80) onClose() // 下スワイプで閉じる
        }}
      >
        <div style={modalStyles.handle} />

        <div style={modalStyles.thread}>
          {messages.map((m: any, i: number) => (
            <div key={i} style={modalStyles.row}>
              <UserBadge username={m.username} size={20} />
              <div style={modalStyles.bubble}>
                <div style={modalStyles.name}>@{m.username}</div>
                <div>{m.content}</div>
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
  card: { display: 'flex', flexDirection: 'column', gap: 8, padding: '0 16px' },
  header: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 },
  user: { display: 'flex', alignItems: 'center', gap: 6 },
  date: { fontSize: 11, color: '#aaa' },
  imageWrapper: { position: 'relative' },
  image: { width: '100%', borderRadius: 8 },
  toggleButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    background: 'rgba(0,0,0,0.3)',
    color: '#fff',
  },
  reaction: {
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
  },
  bubble: {
    position: 'absolute',
    bottom: '140%',
    background: '#000',
    color: '#fff',
    padding: 8,
    borderRadius: 8,
  },
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
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    display: 'flex',
    flexDirection: 'column',
  },
  handle: {
    width: 40,
    height: 4,
    background: '#ccc',
    borderRadius: 2,
    alignSelf: 'center',
    margin: 8,
  },
  thread: {
    flex: 1,
    overflowY: 'auto',
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  row: {
    display: 'flex',
    gap: 8,
  },
  bubble: {
    background: '#f1f1f1',
    padding: 8,
    borderRadius: 8,
  },
  name: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  inputArea: {
    display: 'flex',
    padding: 8,
    borderTop: '1px solid #eee',
  },
  input: {
    flex: 1,
    padding: 8,
  },
  send: {
    marginLeft: 8,
  },
}