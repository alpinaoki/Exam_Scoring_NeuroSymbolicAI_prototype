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
  user_id?: string 
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
  const timeLabel = formatDateTime(createdAt)

  const [reactions, setReactions] = useState<Reaction[]>([])
  const [activeReactionId, setActiveReactionId] = useState<string | null>(null)
  
  // ★ 追加: 新規作成中のピンの状態
  const [preview, setPreview] = useState<{ x: number, y: number, type: string } | null>(null)

  const displayName = anonymous ? 'Anonymous' : username

  useEffect(() => {
    getReactionsByPostId(answerId).then(setReactions)
  }, [answerId])

  const goProfile = () => {
    if (anonymous) return
    router.push(`/profiles/${username}`)
  }

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
        <div style={styles.imageWrapper} id={`image-container-${answerId}`}>
          <img src={image} alt="answer" style={styles.image} />

          {/* 既存のリアクション */}
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
                <div style={{
                  display: 'flex',
                  transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  transform: isActive ? 'scale(1.5) translateY(-5px)' : 'scale(1)',
                  filter: `drop-shadow(0 2px 4px rgba(0,0,0,0.5)) ${isActive ? `drop-shadow(0 0 8px ${themeColor})` : ''}`,
                }}>
                  <ReactionIcon type={r.type} size={22} color="#000" fillColor={themeColor} />
                </div>

                {isActive && (
                  <div style={styles.bubble}>
                    <div style={styles.bubbleHeader}>
                      <UserBadge username={r.username || 'unknown'} size={14} />
                      <span style={styles.reactorName}>@{r.username}</span>
                    </div>
                    {r.comment && <div style={styles.bubbleComment}>{r.comment}</div>}
                  </div>
                )}
              </div>
            )
          })}

          {/* ★ 追加: 編集中のプレビューピン ★ */}
          {preview && (
            <div style={{
              ...styles.reactionContainer,
              left: `${preview.x * 100}%`,
              top: `${preview.y * 100}%`,
              zIndex: 100,
              pointerEvents: 'none', // 入力ボックスのドラッグを邪魔しない
            }}>
              <div style={{ transform: 'scale(1.3)', filter: 'drop-shadow(0 0 10px rgba(255,140,0,0.5))' }}>
                <ReactionIcon type={preview.type} size={24} color="#000" fillColor={getReactionColor(preview.type)} />
              </div>
            </div>
          )}
        </div>
      )}

      <div style={styles.footer}>
        <AnswerActionBar
          problemId={answerId}
          reactionCount={reactions.length}
          // ★ 追加: プレビュー情報を子から受け取る
          onPreviewChange={setPreview}
        />
      </div>
    </div>
  )
}

// styles は現状のものを維持し、適宜微調整してください
const styles: { [key: string]: CSSProperties } = {
  card: { display: 'flex', flexDirection: 'column', gap: 12, padding: '16px', background: '#fff', borderRadius: '16px', border: '1px solid #f0f0f0' },
  header: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 },
  user: { display: 'flex', alignItems: 'center', gap: 6 },
  usernameText: { fontWeight: 600, color: '#333' },
  date: { marginLeft: 4, color: '#aaa', fontSize: 11 },
  imageWrapper: { position: 'relative', width: '100%', lineHeight: 0 },
  image: { width: '100%', borderRadius: '12px', border: '1px solid #eee' },
  reactionContainer: { position: 'absolute', transform: 'translate(-50%, -50%)', cursor: 'pointer', zIndex: 5, padding: '15px' },
  bubble: { position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%) translateY(-10px)', background: 'rgba(0,0,0,0.92)', borderRadius: '10px', padding: '8px 12px', boxShadow: '0 4px 20px rgba(0,0,0,0.4)', zIndex: 10, display: 'flex', flexDirection: 'column', gap: 4, minWidth: '80px' },
  bubbleHeader: { display: 'flex', alignItems: 'center', gap: 6, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 4 },
  reactorName: { fontSize: '11px', fontWeight: 700, color: '#aaa' },
  bubbleComment: { fontSize: '13px', fontWeight: 500, color: '#fff', whiteSpace: 'nowrap' },
  footer: { marginTop: 4 }
}