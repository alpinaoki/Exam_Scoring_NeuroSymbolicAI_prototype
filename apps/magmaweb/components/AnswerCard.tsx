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
  
  // ActionBarから受け取るプレビュー状態
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
      {/* ヘッダー情報 */}
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

      {/* 画像・リアクション表示エリア */}
      {image && (
        <div style={styles.imageWrapper}>
          {/* 画像自体のドラッグ・選択・コンテキストメニューを徹底的に禁止 */}
          <img 
            src={image} 
            alt="answer" 
            style={styles.image} 
            onDragStart={(e) => e.preventDefault()}
            onContextMenu={(e) => e.preventDefault()}
          />

          {/* 保存済みリアクションのループ */}
          {reactions.map((r) => (
            <div 
              key={r.id} 
              style={{ 
                ...styles.reactionContainer, 
                left: `${r.x_float * 100}%`, 
                top: `${r.y_float * 100}%` 
              }} 
              onClick={(e) => {
                e.stopPropagation()
                setActiveReactionId(activeReactionId === r.id ? null : r.id)
              }}
            >
              <div style={{ 
                transform: activeReactionId === r.id ? 'scale(1.4)' : 'scale(1)', 
                transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
              }}>
                {getIcon(r.type, 22, "filled")}
              </div>

              {/* 吹き出しバグ修正版（重なりを防ぐレイアウト） */}
              {activeReactionId === r.id && (
                <div style={styles.bubble}>
                  <div style={styles.bubbleHeader}>
                    <UserBadge username={r.username || ''} size={14} />
                    <span style={styles.reactorName}>@{r.username}</span>
                  </div>
                  <div style={styles.bubbleComment}>{r.comment}</div>
                  {/* 三角形のツノ */}
                  <div style={styles.bubbleArrow} />
                </div>
              )}
            </div>
          ))}

          {/* ★ 新規作成中のプレビューピン（ドラッグの起点） ★ */}
          {preview && (
            <div 
              id="preview-pin"
              style={{ 
                ...styles.reactionContainer, 
                left: `${preview.x * 100}%`, 
                top: `${preview.y * 100}%`, 
                zIndex: 1001,
                cursor: preview.isDragging ? 'grabbing' : 'grab',
                padding: '20px', // タッチ判定を広げる
                touchAction: 'none'
              }}
            >
              <div style={{ 
                transform: 'scale(1.6)', 
                filter: 'drop-shadow(0 0 12px rgba(255,140,0,0.9))',
                pointerEvents: 'none' // アイコン自体がマウスイベントを遮らないようにする
              }}>
                {getIcon(preview.type, 24, "filled")}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 下部アクションバー */}
      <div style={styles.footer}>
        <AnswerActionBar 
          problemId={answerId} 
          reactionCount={reactions.length} 
          onPreviewChange={setPreview} 
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
    position: 'relative' 
  },
  header: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: 6, 
    fontSize: 13 
  },
  user: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: 6 
  },
  usernameText: { 
    fontWeight: 600, 
    color: '#333' 
  },
  date: { 
    color: '#aaa', 
    fontSize: 11 
  },
  imageWrapper: { 
    position: 'relative', 
    width: '100%', 
    lineHeight: 0, 
    overflow: 'visible', // 吹き出しがはみ出せるようにする
    borderRadius: '12px',
    backgroundColor: '#f9f9f9'
  },
  image: { 
    width: '100%', 
    display: 'block', 
    borderRadius: '12px',
    userSelect: 'none',
    pointerEvents: 'auto',
    WebkitUserDrag: 'none'
  },
  reactionContainer: { 
    position: 'absolute', 
    transform: 'translate(-50%, -50%)', 
    zIndex: 10, 
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  bubble: { 
    position: 'absolute', 
    bottom: '140%', // ピンより少し上に配置
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
    backdropFilter: 'blur(4px)'
  },
  bubbleHeader: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: 6, 
    marginBottom: 6, 
    borderBottom: '1px solid rgba(255,255,255,0.2)', 
    paddingBottom: 4 
  },
  reactorName: { 
    fontSize: '11px', 
    fontWeight: 700, 
    color: '#ccc' 
  },
  bubbleComment: { 
    fontWeight: 500, 
    lineHeight: '1.4', 
    whiteSpace: 'normal', 
    wordBreak: 'break-word' 
  },
  bubbleArrow: {
    position: 'absolute',
    top: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    borderWidth: '6px',
    borderStyle: 'solid',
    borderColor: 'rgba(0,0,0,0.85) transparent transparent transparent'
  },
  footer: { 
    marginTop: 4 
  }
}