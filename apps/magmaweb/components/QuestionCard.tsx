'use client'

import { CSSProperties, useState, useEffect } from 'react'
import { MessageCircle, ChevronRight } from 'lucide-react'
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
    // reactions[0] に type='question' のレコードが入ってくる想定
    reactions: Array<{
      id: string
      comment: string | null
      username: string
    }>
  }
}

export default function QuestionCard({ data }: Props) {
  const { problem, answer, reactions } = data
  const [latestMessage, setLatestMessage] = useState<QuestionMessage | null>(null)

  useEffect(() => {
    // 最初の質問（reactions[0]）のJSONを解析して、最新のやり取りをプレビューに出す
    const firstReaction = reactions[0]
    if (firstReaction?.comment) {
      try {
        const json = JSON.parse(firstReaction.comment)
        if (Array.isArray(json) && json.length > 0) {
          setLatestMessage(json[json.length - 1])
        }
      } catch (e) {
        // JSON形式でない場合はそのままテキストとして扱う（互換性のため）
        setLatestMessage({ username: firstReaction.username, content: firstReaction.comment })
      }
    }
  }, [reactions])

  const displayName = problem.anonymous ? 'Anonymous' : problem.username

  return (
    <div style={styles.card}>
      {/* 1. タイトル：投稿時の質問内容 */}
      <div style={styles.titleSection}>
        <div style={styles.userInfo}>
          <UserBadge username={displayName} size={18} />
          <span style={styles.usernameText}>@{displayName}</span>
          <span style={styles.dateText}>{formatDateTime(problem.created_at)}</span>
        </div>
        <h2 style={styles.questionTitle}>
          {problem.label || "質問があります"}
        </h2>
      </div>

      {/* 2. 画像：問題(左) と 解答(右) を並べる */}
      <div style={styles.imageGrid}>
        <div style={styles.imageWrapper}>
          <span style={styles.badge}>問題</span>
          <img src={problem.image_url} alt="Problem" style={styles.img} />
        </div>
        <div style={styles.imageWrapper}>
          <span style={{ ...styles.badge, background: '#e67e22' }}>考え方</span>
          <img src={answer.image_url} alt="My Answer" style={styles.img} />
        </div>
      </div>

      {/* 3. スレッドプレビュー */}
      <div style={styles.threadContainer}>
        <div style={styles.threadHeader}>
          <MessageCircle size={14} />
          <span>最新のやり取り</span>
        </div>

        {latestMessage ? (
          <div style={styles.threadPreview}>
            <div style={styles.threadLine} />
            <div style={styles.messageContent}>
              <span style={styles.msgUser}>@{latestMessage.username}:</span>
              <span style={styles.msgText}>{latestMessage.content}</span>
            </div>
          </div>
        ) : (
          <p style={styles.noReaction}>やり取りを読み込み中...</p>
        )}

        <button style={styles.moreBtn}>
          スレッドを開いて回答する <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

const styles: { [key: string]: CSSProperties } = {
  card: { background: '#fff', borderRadius: '24px', marginBottom: '20px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0' },
  titleSection: { padding: '16px 20px' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' },
  usernameText: { fontSize: '13px', fontWeight: '700', color: '#555' },
  dateText: { fontSize: '11px', color: '#bbb' },
  questionTitle: { fontSize: '17px', fontWeight: '800', color: '#2C3E50', margin: 0, lineHeight: '1.4' },
  imageGrid: { display: 'flex', gap: '2px', background: '#f8f9fa', height: '220px', borderTop: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0' },
  imageWrapper: { flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' },
  badge: { position: 'absolute', top: 8, left: 8, background: 'rgba(44, 62, 80, 0.8)', backdropFilter: 'blur(4px)', color: '#fff', fontSize: '10px', padding: '2px 8px', borderRadius: '6px', zIndex: 1 },
  img: { width: '100%', height: '100%', objectFit: 'contain' },
  threadContainer: { padding: '16px 20px' },
  threadHeader: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#999', marginBottom: '12px', fontWeight: 'bold' },
  threadPreview: { display: 'flex', gap: '10px' },
  threadLine: { width: '2px', background: '#4D96FF', opacity: 0.5, borderRadius: '1px' },
  messageContent: { fontSize: '14px' },
  msgUser: { fontWeight: 'bold', color: '#4D96FF', marginRight: '6px' },
  msgText: { color: '#333' },
  moreBtn: { width: '100%', marginTop: '16px', padding: '10px', background: '#f8f9fa', border: 'none', borderRadius: '12px', color: '#666', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, cursor: 'pointer' },
  noReaction: { fontSize: '13px', color: '#aaa', textAlign: 'center' }
}