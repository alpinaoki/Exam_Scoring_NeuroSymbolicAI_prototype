'use client'

import { CSSProperties, useState, useEffect } from 'react'
import { MessageCircle, ChevronRight, Tag, HelpCircle } from 'lucide-react'
import Link from 'next/link'
import UserBadge from './UserBadge'
import { formatDateTime } from '../lib/time'

type QuestionMessage = {
  username: string
  content: string
}

type Props = {
  data: {
    problem: {
      id: string
      image_url: string
      username: string
      created_at: string
      anonymous: boolean
      label?: string
    }
    answer: {
      id: string
      image_url: string
    }
    reactions: Array<{
      id: string
      comment: string | null
      username: string
      created_at: string
      x_float: number
      y_float: number
    }>
  }
}

export default function QuestionCard({ data }: Props) {
  const { problem, answer, reactions } = data
  const [firstMessage, setFirstMessage] = useState<QuestionMessage | null>(null)

  const rootReaction = reactions && reactions.length > 0 ? reactions[0] : null

  useEffect(() => {
    if (rootReaction?.comment) {
      try {
        const json = JSON.parse(rootReaction.comment)
        if (Array.isArray(json) && json.length > 0) {
          setFirstMessage(json[0])
        }
      } catch (e) {
        setFirstMessage({ username: rootReaction.username || 'unknown', content: rootReaction.comment })
      }
    }
  }, [rootReaction])

  // ユーザー名の確定
  const displayName = rootReaction?.username && rootReaction.username !== 'unknown' 
    ? rootReaction.username 
    : (problem.username || 'unknown')

  const createdAt = rootReaction?.created_at || problem.created_at
  const threadId = rootReaction?.id

  // 座標の取得（数値に強制変換）
  const x = rootReaction ? parseFloat(String(rootReaction.x_float)) : 0
  const y = rootReaction ? parseFloat(String(rootReaction.y_float)) : 0
  const hasValidPos = rootReaction && !isNaN(x) && !isNaN(y)

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.userInfo}>
          <UserBadge username={displayName} size={20} />
          <div style={styles.userTextMeta}>
            <span style={styles.usernameText}>@{displayName}</span>
            <span style={styles.dateText}>{formatDateTime(createdAt)}</span>
          </div>
        </div>
        {problem.label && (
          <div style={styles.tagBadge}>
            <Tag size={12} />
            <span>{problem.label}</span>
          </div>
        )}
      </div>

      <div style={styles.questionSection}>
        {firstMessage ? (
          <p style={styles.questionText}>{firstMessage.content}</p>
        ) : (
          <p style={styles.noReaction}>質問内容を読み込み中...</p>
        )}
      </div>

      <div style={styles.imageStack}>
        <div style={styles.imageBlock}>
          <div style={styles.labelRow}><span style={styles.imageLabel}>問題</span></div>
          <div style={styles.imageContainerFree}>
            <img src={problem.image_url} alt="Problem" style={styles.fullWidthImg} />
          </div>
        </div>

        <div style={styles.imageBlock}>
          <div style={styles.labelRow}><span style={styles.imageLabel}>考え方（解答）</span></div>
          <div style={styles.imageContainerFree}>
            {threadId ? (
              <Link href={`/question/${threadId}`} style={styles.relativeLink}>
                <img src={answer.image_url} alt="My Answer" style={styles.fullWidthImg} draggable={false} />
                {hasValidPos && (
                  <div
                    style={{
                      ...styles.reactionPin,
                      left: `${x * 100}%`,
                      top: `${y * 100}%`,
                    }}
                  >
                    <HelpCircle size={20} fill="#99E6FF" stroke="#444" strokeWidth={1.2} />
                  </div>
                )}
              </Link>
            ) : (
              <img src={answer.image_url} alt="My Answer" style={styles.fullWidthImg} />
            )}
          </div>
        </div>
      </div>

      <div style={styles.footer}>
        {threadId ? (
          <Link href={`/question/${threadId}`} style={{ textDecoration: 'none' }}>
            <button style={styles.moreBtn}>
              <MessageCircle size={18} />
              スレッドで詳しく見る・回答する 
              <ChevronRight size={18} style={styles.btnArrow} />
            </button>
          </Link>
        ) : (
          <div style={styles.disabledBtn}>
            <MessageCircle size={18} />
            スレッドを取得中...
          </div>
        )}
      </div>
    </div>
  )
}

const styles: { [key: string]: CSSProperties } = {
  card: { background: '#fff', borderRadius: '28px', marginBottom: '28px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.06)', border: '1px solid #f2f2f2' },
  header: { padding: '20px 24px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '10px' },
  userTextMeta: { display: 'flex', flexDirection: 'column' },
  usernameText: { fontSize: '14px', fontWeight: '800', color: '#2C3E50' },
  dateText: { fontSize: '11px', color: '#bbb', marginTop: '1px' },
  tagBadge: { display: 'flex', alignItems: 'center', gap: '5px', background: '#f0f4f8', color: '#667eea', padding: '5px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold', marginTop: '-2px' },
  questionSection: { padding: '0 28px 24px' },
  questionText: { fontSize: '20px', fontWeight: '800', color: '#1a1a1a', margin: 0, lineHeight: '1.6', letterSpacing: '-0.02em' },
  imageStack: { display: 'flex', flexDirection: 'column', gap: '20px', padding: '0 16px 20px', background: '#fff' },
  imageBlock: { display: 'flex', flexDirection: 'column', gap: '8px' },
  labelRow: { padding: '0 8px' },
  imageLabel: { background: '#f0f2f5', color: '#4d545d', fontSize: '11px', padding: '4px 10px', borderRadius: '8px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' },
  imageContainerFree: { width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid #f0f0f0', background: '#fff' },
  relativeLink: { position: 'relative', display: 'block', width: '100%', textDecoration: 'none' },
  fullWidthImg: { width: '100%', height: 'auto', display: 'block' },
  reactionPin: { position: 'absolute', transform: 'translate(-50%, -50%)', zIndex: 10, filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.3))', pointerEvents: 'none' },
  footer: { padding: '16px 20px 20px' },
  moreBtn: { width: '100%', padding: '16px', background: '#4D96FF10', border: 'none', borderRadius: '18px', color: '#4D96FF', fontSize: '15px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer' },
  btnArrow: { opacity: 0.7 },
  disabledBtn: { width: '100%', padding: '16px', background: '#f5f5f5', borderRadius: '18px', color: '#ccc', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 },
  noReaction: { fontSize: '14px', color: '#aaa' }
}