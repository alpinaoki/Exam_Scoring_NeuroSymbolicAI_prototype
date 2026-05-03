'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getQuestionThreads, updateReactionComment } from '../../../lib/posts'
import QuestionCard from '../../../components/QuestionCard'
import UserBadge from '../../../components/UserBadge'
import LayoutShell from '../../../components/LayoutShell' // 追加
import { Send, ChevronLeft } from 'lucide-react'

export default function ThreadPage() {
  const { id } = useParams()
  const router = useRouter()
  const [threadItem, setThreadItem] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [replyText, setReplyText] = useState('')

  useEffect(() => {
    if (id) {
      getQuestionThreads(id as string).then(results => {
        if (results && results.length > 0) {
          const item = results[0]
          setThreadItem(item)
          
          try {
            const json = JSON.parse(item.comment || '[]')
            setMessages(Array.isArray(json) ? json : [])
          } catch {
            // 文字列の場合、解答者の名前を添えて表示
            setMessages([{ 
              username: item.post?.profiles?.handle || 'unknown', 
              content: item.comment 
            }])
          }
        }
      })
    }
  }, [id])

  if (!threadItem || !threadItem.post?.parent) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>スレッドを読み込み中...</div>
  }

  // QuestionCard.tsx に渡すデータを整形
  const cardData = {
    problem: {
      id: threadItem.post.parent.id,
      image_url: threadItem.post.parent.image_url,
      username: threadItem.post.parent.profiles?.handle || 'unknown',
      created_at: threadItem.post.parent.created_at,
      anonymous: threadItem.post.parent.anonymous,
      label: threadItem.post.parent.label
    },
    answer: {
      id: threadItem.post.id,
      image_url: threadItem.post.image_url
    },
    reactions: [{
      ...threadItem,
      // FeedPageに合わせて解答者のハンドルネームをセット
      username: threadItem.post?.profiles?.handle || 'unknown'
    }]
  }

  const handleSend = async () => {
    if (!replyText.trim()) return
    // 本来はここにログインユーザー名を入れる
    const newMessage = { username: 'you', content: replyText }
    const nextMessages = [...messages, newMessage]
    setMessages(nextMessages)
    setReplyText('')
    await updateReactionComment(id as string, JSON.stringify(nextMessages))
  }

  return (
    <LayoutShell>
      <div style={styles.container}>
        {/* ヘッダーの下にくるように top: 32px に設定 */}
        <div style={styles.nav}>
          <button onClick={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={20} /> 戻る
          </button>
          <span style={styles.navTitle}>スレッド詳細</span>
        </div>

        <div style={{ padding: '16px' }}>
          {/* showLink={false} を追加 */}
          <QuestionCard data={cardData} showLink={false} />
        </div>

        <div style={styles.messageList}>
          <h3 style={styles.sectionTitle}>やり取り</h3>
          {messages.map((m, i) => (
            <div key={i} style={styles.messageRow}>
              <UserBadge username={m.username} size={24} />
              <div style={styles.messageContent}>
                <div style={styles.msgName}>@{m.username}</div>
                <div style={styles.msgBubble}>{m.content}</div>
              </div>
            </div>
          ))}
        </div>

        {/* LayoutShellのフッター(54px)の上に来るように bottom: 54px に設定 */}
        <div style={styles.inputContainer}>
          <input 
            style={styles.input} 
            value={replyText} 
            onChange={e => setReplyText(e.target.value)} 
            placeholder="返信..." 
          />
          <button style={styles.sendBtn} onClick={handleSend}><Send size={18} /></button>
        </div>
      </div>
    </LayoutShell>
  )
}

const styles = {
  // コンテンツが入力欄(約80px) + フッター(54px)に隠れないよう paddingBottom を広めに
  container: { maxWidth: '600px', margin: '0 auto', background: '#f9fafb', minHeight: '100vh', paddingBottom: '160px' },
  
  // LayoutShell のヘッダー(32px)の下に固定
  nav: { 
    padding: '16px', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '12px', 
    background: '#fff', 
    borderBottom: '1px solid #eee', 
    position: 'sticky' as const, 
    top: 32, 
    zIndex: 10 
  },
  
  backBtn: { background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '4px', color: '#666', cursor: 'pointer' },
  navTitle: { fontWeight: 'bold' as const },
  messageList: { padding: '0 20px' },
  sectionTitle: { fontSize: '13px', color: '#aaa', marginBottom: '16px', textTransform: 'uppercase' as const, letterSpacing: '0.05em' },
  messageRow: { display: 'flex', gap: '12px', marginBottom: '20px' },
  messageContent: { flex: 1 },
  msgName: { fontSize: '12px', color: '#888', marginBottom: '4px', fontWeight: 'bold' as const },
  msgBubble: { background: '#fff', padding: '12px 16px', borderRadius: '16px', fontSize: '15px', color: '#333', border: '1px solid #f0f0f0' },
  
  // LayoutShell のフッター(54px)の上に固定
  inputContainer: { 
    position: 'fixed' as const, 
    bottom: 54, 
    width: '100%', 
    maxWidth: '600px', 
    padding: '16px', 
    background: '#fff', 
    borderTop: '1px solid #eee', 
    display: 'flex', 
    gap: '12px',
    zIndex: 1001 
  },
  
  input: { flex: 1, padding: '12px 20px', borderRadius: '24px', border: '1px solid #eee', fontSize: '16px', background: '#f8f9fa' },
  sendBtn: { background: '#4D96FF', color: '#fff', border: 'none', borderRadius: '50%', width: '46px', height: '46px', display: 'flex', alignItems: 'center', justifyContent: 'center' }
}