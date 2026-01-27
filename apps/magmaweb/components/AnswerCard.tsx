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
  type: string
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

export default function AnswerCard({ image, answerId, username, createdAt, anonymous }: Props) {
  const router = useRouter()
  const [reactions, setReactions] = useState<Reaction[]>([])
  const [activeReactionId, setActiveReactionId] = useState<string | null>(null)
  const [preview, setPreview] = useState<{ x: number, y: number, type: string, isDragging?: boolean } | null>(null)

  const displayName = anonymous ? 'Anonymous' : username

  useEffect(() => {
    getReactionsByPostId(answerId).then(setReactions)
  }, [answerId])

  const getIcon = (type: string, size = 22, fill = "none") => {
    const props = { size, style: { color: '#000' } }
    if (type === 'star') return <Star {...props} fill={fill === "none" ? "none" : "#FFD700"} />
    if (type === 'exclamation') return <AlertTriangle {...props} fill={fill === "none" ? "none" : "#FF4500"} />
    return <HelpCircle {...props} fill={fill === "none" ? "none" : "#00BFFF"} />
  }

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={{ ...styles.user, cursor: anonymous ? 'default' : 'pointer' }} onClick={() => !anonymous && router.push(`/profiles/${username}`)}>
          <UserBadge username={displayName} />
          <span style={styles.usernameText}>@{displayName}</span>
        </div>
        <span style={styles.date}>· {formatDateTime(createdAt)}</span>
      </div>

      {image && (
        <div style={styles.imageWrapper}>
          <img src={image} alt="answer" style={styles.image} />

          {reactions.map((r) => (
            <div key={r.id} style={{ ...styles.reactionContainer, left: `${r.x_float * 100}%`, top: `${r.y_float * 100}%` }} onClick={() => setActiveReactionId(activeReactionId === r.id ? null : r.id)}>
              <div style={{ transform: activeReactionId === r.id ? 'scale(1.4)' : 'scale(1)', transition: '0.2s' }}>
                {getIcon(r.type, 22, "filled")}
              </div>
              {activeReactionId === r.id && (
                <div style={styles.bubble}>
                  <div style={styles.bubbleHeader}>
                    <UserBadge username={r.username || ''} size={14} />
                    <span style={styles.reactorName}>@{r.username}</span>
                  </div>
                  <div style={styles.bubbleComment}>{r.comment}</div>
                </div>
              )}
            </div>
          ))}

          {/* ★ プレビューピン：ここ自体をドラッグ可能にする ★ */}
          {preview && (
            <div 
              id="preview-pin"
              style={{ 
                ...styles.reactionContainer, 
                left: `${preview.x * 100}%`, 
                top: `${preview.y * 100}%`, 
                zIndex: 1000,
                cursor: 'grab',
                touchAction: 'none'
              }}
            >
              <div style={{ transform: 'scale(1.5)', filter: 'drop-shadow(0 0 8px rgba(255,140,0,0.8))' }}>
                {getIcon(preview.type, 24, "filled")}
              </div>
            </div>
          )}
        </div>
      )}

      <div style={styles.footer}>
        <AnswerActionBar problemId={answerId} reactionCount={reactions.length} onPreviewChange={setPreview} />
      </div>
    </div>
  )
}

const styles: { [key: string]: CSSProperties } = {
  card: { display: 'flex', flexDirection: 'column', gap: 12, padding: '16px', background: '#fff', borderRadius: '16px', border: '1px solid #f0f0f0', position: 'relative' },
  header: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 },
  user: { display: 'flex', alignItems: 'center', gap: 6 },
  usernameText: { fontWeight: 600, color: '#333' },
  date: { color: '#aaa', fontSize: 11 },
  imageWrapper: { position: 'relative', width: '100%', lineHeight: 0, overflow: 'visible', borderRadius: '12px' },
  image: { width: '100%', display: 'block', borderRadius: '12px' },
  reactionContainer: { position: 'absolute', transform: 'translate(-50%, -50%)', zIndex: 10, cursor: 'pointer' },
  bubble: { 
    position: 'absolute', bottom: '120%', left: '50%', transform: 'translateX(-50%)', 
    background: 'rgba(0,0,0,0.85)', color: '#fff', padding: '8px 12px', borderRadius: '12px', 
    fontSize: '12px', minWidth: '100px', zIndex: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' 
  },
  bubbleHeader: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: 4 },
  reactorName: { fontSize: '11px', fontWeight: 700, color: '#ccc' },
  bubbleComment: { fontWeight: 500, lineHeight: '1.4', whiteSpace: 'normal', wordBreak: 'break-word' },
  footer: { marginTop: 4 }
}