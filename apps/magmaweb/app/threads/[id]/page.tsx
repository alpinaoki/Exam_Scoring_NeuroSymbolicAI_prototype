'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  getProblemById,
  getAnswersByProblemId,
} from '../../../lib/posts'
import { getCurrentUser } from '../../../lib/auth'
import ProblemCard from '../../../components/ProblemCard'
import AnswerCard from '../../../components/AnswerCard'
import { CircleArrowLeft } from 'lucide-react'

export default function ThreadPage({
  params,
}: {
  params: { id: string }
}) {
  const [problem, setProblem] = useState<any>(null)
  const [answers, setAnswers] = useState<any[]>([])
  const [canViewAnswers, setCanViewAnswers] = useState(false)
  const [randomMessage, setRandomMessage] = useState('') // メッセージ用ステート
  const router = useRouter()

  const promptMessages = [
    "答えにたどり着いていなくても大丈夫！上のボタンからアイデアを投稿して、他の人の考え方も見てみよう！",
    "「ここまでは分かった」という途中経過も大歓迎！みんなの知恵を借りる一歩を踏み出して！",
    "正解することより、考える過程が宝物。あなたのユニークな発想をぜひシェアしよう！",
    "まだ誰も気づいていないヒントがあなたの手元にあるかも。匿名でも投稿できる！",
    "あなたの「分からない」が、他の誰かの「分かった」につながる。まずは一枚、送ってみよう！",
    "完璧な答案じゃなくていいんです。間違いこそが宝物！"
  ]

  useEffect(() => {
    async function load() {
      // 読み込み時にメッセージをランダム選択
      const msg = promptMessages[Math.floor(Math.random() * promptMessages.length)]
      setRandomMessage(msg)

      try {
        // ★ getCurrentUser()に.catch(() => null)を入れることで、未ログイン時のエラー落ちを防ぐ
        const [p, a, user] = await Promise.all([
          getProblemById(params.id),
          getAnswersByProblemId(params.id),
          getCurrentUser().catch(() => null),
        ])

        setProblem(p)
        setAnswers(a)

        // ★ 未ログイン時は、現在の投稿URLを保持してログイン画面へ強制リダイレクト
        if (!user) {
          setCanViewAnswers(false)
          const currentPath = window.location.pathname
          router.push(`/login?next=${encodeURIComponent(currentPath)}`)
          return
        }

        const isProblemOwner = p.user_id === user.id
        const hasPostedAnswer = a.some(
          (ans) => ans.user_id === user.id
        )

        setCanViewAnswers(isProblemOwner || hasPostedAnswer)

      } catch (error) {
        console.error("データ読み込み中にエラーが発生しました:", error)
        // 万が一postsデータの取得エラーなどが起きた場合も、Loadingで固まるのを防ぐためログインかトップへ逃がす
        const currentPath = window.location.pathname
        router.push(`/login?next=${encodeURIComponent(currentPath)}`)
      }
    }

    load()
  }, [params.id])

  if (!problem) {
    return <div style={{ padding: 20 }}>Loading...</div>
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 問題セクション */}
      <div
        style={{
          width: '100%',
          padding: '0 8px 32px',
          maxWidth: '800px',
          margin: '0 auto',
        }}
      >
        <button
          onClick={() => router.(`/feed`)}
          style={{
            background: 'none',
            border: 'none',
            color: '#333',
            cursor: 'pointer',
            padding: '10px 0',
            marginTop: '10px',
          }}
        >
          <CircleArrowLeft size={30} />
        </button>

        <ProblemCard
          image={problem.image_url}
          problemId={problem.id}
          username={problem.profiles.handle}
          label={problem.label}
          createdAt={problem.created_at}
        />
      </div>

      {/* 解答セクション */}
      <div
        style={{
          flexGrow: 1,
          background:
            'linear-gradient(to bottom, #ffffff 0%, #f1ece1b6 1%, #e6dbcab6 5%, #e0cac3b6 60%, #d2b6ae 99%, #ffffff 100%)',
          padding: '24px 8px 48px',
        }}
      >
        <div
          style={{
            maxWidth: '800px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {canViewAnswers ? (
            answers.map((a) => (
              <div
                key={a.id}
                style={{
                  filter:
                    'drop-shadow(0 4px 12px rgba(0,0,0,0.08))',
                }}
              >
                <AnswerCard
                  image={a.image_url}
                  answerId={a.id}
                  rootId={problem.id}
                  username={a.profiles.handle}
                  createdAt={a.created_at}
                  anonymous = {a.anonymous}
                />
              </div>
            ))
          ) : (
            <div
              style={{
                marginTop: 40,
                padding: '32px 16px',
                textAlign: 'center',
                color: '#555',
                background: 'rgba(255,255,255,0.6)',
                borderRadius: 12,
                fontSize: 15,
                lineHeight: 1.6,
              }}
            >
              {randomMessage}
              （１件以上投稿すると他の人の考えが見れるようになります）
            </div>
          )}
        </div>
      </div>
    </div>
  )
}