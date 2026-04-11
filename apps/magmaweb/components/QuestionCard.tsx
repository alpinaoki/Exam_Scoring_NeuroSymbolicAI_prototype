'use client'

import { CSSProperties, useState, useEffect } from 'react'
import { MessageCircle, ChevronRight, Tag } from 'lucide-react'
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
    }>
  }
}

export default function QuestionCard({ data }: Props) {
  const { problem, answer, reactions } = data
  const [firstMessage, setFirstMessage] = useState<QuestionMessage | null>(null)

  useEffect(() => {
    // 最初の質問（reactions[0]）の最初のコメントを目立たせる
    const firstReaction = reactions[0]
    if (firstReaction?.comment) {
      try {
        const json = JSON.parse(firstReaction.comment)
        if (Array.isArray(json) && json.length > 0) {
          // 配列の先頭（最初の質問メッセージ）を取得
          setFirstMessage(json[0])
        }
      } catch (e) {
        setFirstMessage({ username: firstReaction.username, content: firstReaction.comment })
      }
    }
  }, [reactions])

  const displayName = problem.anonymous ? 'Anonymous' : problem.username

  return (
    <div style={styles.card}>
      {/* 1. ヘッダー：ユーザー情報と控えめなタグ */}
      <div style={styles.header}>
        <div style={styles.userInfo}>
          <UserBadge username={displayName} size={18} />
          <span style={styles.usernameText}>@{displayName}</span>
          <span style={styles.dateText}>{formatDateTime(problem.created_at)}</span>
        </div>
        {problem.label && (
          <div style={styles.tagBadge}>
            <Tag size={10} />
            <span>{problem.label}</span>
          </div>
        )}
      </div>

      {/* 2. 質問内容（ここを一番目立たせる） */}
      <div style={styles.questionSection}>
        {firstMessage ? (
          <div style={styles.mainQuote}>
            <span style={styles.quoteSymbol}>“</span>
            <p style={styles.questionText}>{firstMessage.content}</p>
          </div>
        ) : (
          <p style={styles.noReaction}>質問を読み込み中...</p>
        )}
      </div>

      {/* 3. 画像：縦に並べる */}
      <div style={styles.imageStack}>
        <div style={styles.imageWrapper}>
          <span style={styles.imageLabel}>問題</span>
          <img src={problem.image_url} alt="Problem" style={styles.img} />
        </div>
        <div style={styles.imageWrapper}>
          <span style={{ ...styles.imageLabel, background: '#e67e22' }}>考え方</span>
          <img src={answer.image_url} alt="My Answer" style={styles.img} />
        </div>
      </div>

      {/* 4. フッターアクション */}
      <div style={styles.footer}>
        <button style={styles.moreBtn}>
          <MessageCircle size={16} />
          スレッドで詳しく見る・回答する 
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

const styles: { [key: string]: CSSProperties } = {
  card: { background: '#fff', borderRadius: '24px', marginBottom: '24px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0' },
  header: { padding: '16px 20px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '8px' },
  usernameText: { fontSize: '13px', fontWeight: '700', color: '#555' },
  dateText: { fontSize: '11px', color: '#bbb' },
  tagBadge: { display: 'flex', alignItems: 'center', gap: '4px', background: '#f0f4f8', color: '#667eea', padding: '4px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold' },
  questionSection: { padding: '0 24px 20px' },
  mainQuote: { position: 'relative', paddingLeft: '16px' },
  quoteSymbol: { position: 'absolute', left: -4, top: -10, fontSize: '40px', color: '#4D96FF', opacity: 0.3, fontFamily: 'serif' },
  questionText: { fontSize: '18px', fontWeight: '800', color: '#2C3E50', margin: 0, lineHeight: '1.5', letterSpacing: '-0.02em' },
  imageStack: { display: 'flex', flexDirection: 'column', gap: '2px', background: '#f8f9fa' },
  imageWrapper: { position: 'relative', width: '100%', minHeight: '150px', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  imageLabel: { position: 'absolute', top: 12, left: 12, background: 'rgba(44, 62, 80, 0.8)', backdropFilter: 'blur(4px)', color: '#fff', fontSize: '11px', padding: '3px 10px', borderRadius: '6px', zIndex: 1, fontWeight: 'bold' },
  img: { width: '100%', height: 'auto', display: 'block' },
  footer: { padding: '16px 20px' },
  moreBtn: { width: '100%', padding: '14px', background: '#4D96FF10', border: 'none', borderRadius: '16px', color: '#4D96FF', fontSize: '14px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', transition: '0.2s' },
  noReaction: { fontSize: '13px', color: '#aaa' }
}