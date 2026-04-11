'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getQuestionThreads, updateReactionComment } from '../../../lib/posts'
import QuestionCard from '../../../components/QuestionCard'
import UserBadge from '../../../components/UserBadge'
import { Send, ChevronLeft } from 'lucide-react'

export default function ThreadPage() {
  const { id } = useParams()
  const router = useRouter()
  const [threadItem, setThreadItem] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [replyText, setReplyText] = useState('')

  useEffect(() => {
    if (id) {
      // 既存のロジックで取得（1件でも配列で返る）
      getQuestionThreads(id as string).then(results => {
        if (results && results.length > 0) {
          const item = results[0]
          setThreadItem(item)
          
          // メッセージのパース
          try {
            const json = JSON.parse(item.comment || '[]')
            setMessages(Array.isArray(json) ? json : [])
          } catch {
            // JSONじゃない場合（古いデータなど）のフォールバック
            setMessages([{ username: item.post?.profiles?.handle || 'unknown', content: item.comment }])
          }
        }
      })
    }
  }, [id])

  if (!threadItem || !threadItem.post?.parent) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>スレッドを読み込み中...</div>
  }

  // QuestionCard.tsx の Props 構造に合わせる
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
    reactions: [threadItem]
  }

  const handleSend = async () => {
    if (!replyText.trim()) return
    const newMessage = { username: 'you', content: replyText }
    const nextMessages = [...messages, newMessage]
    setMessages(nextMessages)
    setReplyText('')
    await updateReactionComment(id as string, JSON.stringify(nextMessages))
  }

  return (
    <div style={styles.container}>
      <div style={styles.nav}>
        <button onClick={() => router.back()} style={styles.backBtn}><ChevronLeft size={20} /> 戻る</button>
        <span style={styles.navTitle}>スレッド詳細</span>
      </div>

      <div style={{ padding: '16px' }}>
        <QuestionCard data={cardData} />
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
  )
}

const styles = {
  container: { maxWidth: '600px', margin: '0 auto', background: '#f9fafb', minHeight: '100vh', paddingBottom: '100px' },
  nav: { padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', borderBottom: '1px solid #eee', position: 'sticky' as const, top: 0, zIndex: 10 },
  backBtn: { background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '4px', color: '#666', cursor: 'pointer' },
  navTitle: { fontWeight: 'bold' as const },
  messageList: { padding: '0 20px' },
  sectionTitle: { fontSize: '13px', color: '#aaa', marginBottom: '16px', textTransform: 'uppercase' as const, letterSpacing: '0.05em' },
  messageRow: { display: 'flex', gap: '12px', marginBottom: '20px' },
  messageContent: { flex: 1 },
  msgName: { fontSize: '12px', color: '#888', marginBottom: '4px', fontWeight: 'bold' as const },
  msgBubble: { background: '#fff', padding: '12px 16px', borderRadius: '16px', fontSize: '15px', color: '#333', border: '1px solid #f0f0f0' },
  inputContainer: { position: 'fixed' as const, bottom: 0, width: '100%', maxWidth: '600px', padding: '16px', background: '#fff', borderTop: '1px solid #eee', display: 'flex', gap: '12px' },
  input: { flex: 1, padding: '12px 20px', borderRadius: '24px', border: '1px solid #eee', fontSize: '16px', background: '#f8f9fa' },
  sendBtn: { background: '#4D96FF', color: '#fff', border: 'none', borderRadius: '50%', width: '46px', height: '46px', display: 'flex', alignItems: 'center', justifyContent: 'center' }
}