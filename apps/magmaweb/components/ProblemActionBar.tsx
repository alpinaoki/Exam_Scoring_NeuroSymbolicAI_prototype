// components/ProblemActionBar.tsx
'use client'

import { uploadImageToCloudinary } from '../lib/upload'
import { createAnswer } from '../lib/posts'
import { Lightbulb, Heart } from 'lucide-react'

type Props = {
  problemId: string
  rootId: string
  bookmarkCount: number
  answerCount: number
}

export default function ProblemActionBar({
  problemId,
  rootId,
  bookmarkCount,
  answerCount,
}: Props) {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', // 親要素を center にして全体の高さを揃える
      gap: 16, 
      color: 'black' 
    }}>
      <label style={{ 
        cursor: 'pointer', 
        color: 'black',
        display: 'inline-flex', // これを追加
        alignItems: 'center',    // これを追加
        gap: 4                  // アイコンと文字の間の微調整
      }}>
        <Lightbulb size={20} />
        <span>解答 {answerCount}</span>
        <input
          type="file"
          accept="image/*"
          hidden
          onChange={async (e) => {
            const file = e.target.files?.[0]
            if (!file) return
            const imageUrl = await uploadImageToCloudinary(file)
            await createAnswer({ imageUrl, problemId, rootId })
            alert('解答を投稿しました')
          }}
        />
      </label>

      <span style={{ 
        display: 'inline-flex', // これを追加
        alignItems: 'center',    // これを追加
        gap: 4                  // アイコンと文字の間の微調整
      }}>
        <Heart size={20} />
        <span>いいね {bookmarkCount}</span>
      </span>
    </div>
  )
}
