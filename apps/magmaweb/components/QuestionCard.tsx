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
      username: string // ※これは使わなくなります
      created_at: string
      anonymous: boolean // ※これも使わなくなります
      label?: string
    }
    answer: {
      id: string
      image_url: string
    }
    // reactions[0] に type='question' の起点レコードが入ってくる想定
    reactions: Array<{
      id: string
      comment: string | null
      username: string // ★これを投稿者として使います
      created_at: string // ★これもリアクションの作成日を使います
      x_float: number // ★ピンの位置用
      y_float: number // ★ピンの位置用
    }>
  }
}

export default function QuestionCard({ data }: Props) {
  const { problem, answer, reactions } = data
  const [firstMessage, setFirstMessage] = useState<QuestionMessage | null>(null)

  // 起点となるリアクションデータ
  const rootReaction = reactions[0]

  useEffect(() => {
    // 最初のリアクションの最初のコメントを目立たせる
    if (rootReaction?.comment) {
      try {
        const json = JSON.parse(rootReaction.comment)
        if (Array.isArray(json) && json.length > 0) {
          setFirstMessage(json[0])
        }
      } catch (e) {
        setFirstMessage({ username: rootReaction.username, content: rootReaction.comment })
      }
    }
  }, [rootReaction])

  // ★投稿者は、問題の投稿者ではなく、リアクションの作成者
  const displayName = rootReaction?.username || 'unknown'
  const createdAt = rootReaction?.created_at || problem.created_at
  const threadId = rootReaction?.id

  // ピンのスタイル（AnswerCardから拝修）
  const pinIcon = (
    <HelpCircle 
      size={18} 
      fill="#99E6FF" 
      stroke="#444" 
      strokeWidth={1.2} 
    />
  )

  return (
    <div style={styles.card}>
      {/* 1. ヘッダー：リアクション作成者の情報 */}
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

      {/* 2. 質問内容（ここが主役） */}
      <div style={styles.questionSection}>
        {firstMessage ? (
          <p style={styles.questionText}>{firstMessage.content}</p>
        ) : (
          <p style={styles.noReaction}>質問内容を読み込み中...</p>
        )}
      </div>

      {/* 3. 画像セクション：縦に並べる。文字は重ねない */}
      <div style={styles.imageStack}>
        
        {/* 問題画像 */}
        <div style={styles.imageBlock}>
          <div style={styles.labelRow}>
            <span style={styles.imageLabel}>問題</span>
          </div>
          <div style={styles.imageContainer}>
            <img src={problem.image_url} alt="Problem" style={styles.img} />
          </div>
        </div>

        {/* 考え方画像：ここにピンを出す */}
        <div style={styles.imageBlock}>
          <div style={styles.labelRow}>
            <span style={styles.imageLabel}>考え方（解答）</span>
          </div>
          <div style={styles.imageContainer}>
            {threadId ? (
              <Link href={`/question/${threadId}`} style={styles.pinWrapper}>
                <img src={answer.image_url} alt="My Answer" style={styles.img} />
                
                {/* ★ここに質問のピンを表示 */}
                {rootReaction && (
                  <div
                    style={{
                      ...styles.reactionPin,
                      left: `${rootReaction.x_float * 100}%`,
                      top: `${rootReaction.y_float * 100}%`,
                    }}
                  >
                    {pinIcon}
                  </div>
                )}
              </Link>
            ) : (
              <img src={answer.image_url} alt="My Answer" style={styles.img} />
            )}
          </div>
        </div>

      </div>

      {/* 4. フッターアクション：詳細ページへのリンク */}
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
  
  // ヘッダー周り
  header: { padding: '20px 24px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '10px' },
  userTextMeta: { display: 'flex', flexDirection: 'column' },
  usernameText: { fontSize: '14px', fontWeight: '800', color: '#2C3E50' },
  dateText: { fontSize: '11px', color: '#bbb', marginTop: '1px' },
  tagBadge: { display: 'flex', alignItems: 'center', gap: '5px', background: '#f0f4f8', color: '#667eea', padding: '5px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold', marginTop: '-2px' },
  
  // 質問テキスト
  questionSection: { padding: '0 28px 24px' },
  questionText: { fontSize: '20px', fontWeight: '800', color: '#1a1a1a', margin: 0, lineHeight: '1.6', letterSpacing: '-0.02em' },
  
  // 画像セクション（文字と重ねない）
  imageStack: { display: 'flex', flexDirection: 'column', gap: '20px', padding: '0 16px 20px', background: '#fff' },
  imageBlock: { display: 'flex', flexDirection: 'column', gap: '8px' },
  labelRow: { padding: '0 8px' },
  imageLabel: { background: '#f0f2f5', color: '#4d545d', fontSize: '11px', padding: '4px 10px', borderRadius: '8px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' },
  imageContainer: { position: 'relative', width: '100%', background: '#f8f9fa', borderRadius: '16px', overflow: 'hidden', border: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  img: { width: '100%', height: 'auto', display: 'block' },
  
  // ピン関連
  pinWrapper: { position: 'relative', width: '100%', display: 'block', textDecoration: 'none' },
  reactionPin: { position: 'absolute', transform: 'translate(-50%, -50%)', zIndex: 10, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' },

  // フッター
  footer: { padding: '16px 20px 20px' },
  moreBtn: { width: '100%', padding: '16px', background: '#4D96FF10', border: 'none', borderRadius: '18px', color: '#4D96FF', fontSize: '15px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer', transition: '0.2s all' },
  btnArrow: { opacity: 0.7 },
  disabledBtn: { width: '100%', padding: '16px', background: '#f5f5f5', borderRadius: '18px', color: '#ccc', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 },
  noReaction: { fontSize: '14px', color: '#aaa' }
}