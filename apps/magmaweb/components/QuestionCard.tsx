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

  // 起点となるリアクションデータ（ピンの座標はこのデータを使う）
  const rootReaction = reactions[0]

  useEffect(() => {
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

  const displayName = rootReaction?.username || 'unknown'
  const createdAt = rootReaction?.created_at || problem.created_at
  const threadId = rootReaction?.id

  const pinIcon = (
    <HelpCircle 
      size={20} 
      fill="#99E6FF" 
      stroke="#444" 
      strokeWidth={1.2} 
    />
  )

  return (
    <div style={styles.card}>
      {/* 1. ヘッダー */}
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

      {/* 2. 質問内容 */}
      <div style={styles.questionSection}>
        {firstMessage ? (
          <p style={styles.questionText}>{firstMessage.content}</p>
        ) : (
          <p style={styles.noReaction}>質問内容を読み込み中...</p>
        )}
      </div>

      {/* 3. 画像セクション */}
      <div style={styles.imageStack}>
        
        {/* 問題画像：横幅いっぱい、余白なし */}
        <div style={styles.imageBlock}>
          <div style={styles.labelRow}>
            <span style={styles.imageLabel}>問題</span>
          </div>
          <div style={styles.imageContainerFree}>
            <img src={problem.image_url} alt="Problem" style={styles.fullWidthImg} />
          </div>
        </div>

        {/* 考え方画像：ピンの座標を画像に同期 */}
        <div style={styles.imageBlock}>
          <div style={styles.labelRow}>
            <span style={styles.imageLabel}>考え方（解答）</span>
          </div>
          
          <div style={styles.imageContainerFree}>
            {threadId ? (
              <Link href={`/question/${threadId}`} style={styles.relativeLink}>
                <img 
                  src={answer.image_url} 
                  alt="My Answer" 
                  style={styles.fullWidthImg} 
                  draggable={false} 
                />
                
                {/* 画像に対して相対位置で配置 */}
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
              <img src={answer.image_url} alt="My Answer" style={styles.fullWidthImg} />
            )}
          </div>
        </div>
      </div>

      {/* 4. フッター */}
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
  
  // 余白を消すため、高さを指定せず「中身（画像）なり」にする
  imageContainerFree: { 
    width: '100%', 
    borderRadius: '16px', 
    overflow: 'hidden', 
    border: '1px solid #f0f0f0',
    background: '#fff', // 背景を白にして黒帯を追放
  },

  // Linkを画像と全く同じサイズにする（ピンの座標計算のベース）
  relativeLink: { 
    position: 'relative', 
    display: 'block', 
    width: '100%',
    textDecoration: 'none' 
  },

  // 画像を横幅マックスにし、高さはアスペクト比を維持
  fullWidthImg: { 
    width: '100%',
    height: 'auto',
    display: 'block'
  },
  
  // ピン：親要素の Link に対して絶対座標で配置
  reactionPin: { 
    position: 'absolute', 
    transform: 'translate(-50%, -50%)', 
    zIndex: 10, 
    filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.3))',
    pointerEvents: 'none' // Linkのクリックを邪魔しない場合。クリックさせたければ削除
  },

  footer: { padding: '16px 20px 20px' },
  moreBtn: { width: '100%', padding: '16px', background: '#4D96FF10', border: 'none', borderRadius: '18px', color: '#4D96FF', fontSize: '15px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer' },
  btnArrow: { opacity: 0.7 },
  disabledBtn: { width: '100%', padding: '16px', background: '#f5f5f5', borderRadius: '18px', color: '#ccc', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 },
  noReaction: { fontSize: '14px', color: '#aaa' }
}