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
    <div style={{ display: 'flex', gap: 16 , color: 'black'}}>
      <span><Heart size = {10}/> {bookmarkCount}</span>

      <label style={{ cursor: 'pointer', color:'black' }}>
        <Lightbulb size = {10}/> {answerCount}
        <input
          type="file"
          accept="image/*"
          hidden
          onChange={async (e) => {
            const file = e.target.files?.[0]
            if (!file) return

            const imageUrl = await uploadImageToCloudinary(file)

            await createAnswer({
              imageUrl,
              problemId,
              rootId,
            })

            alert('解答を投稿しました')
          }}
        />
      </label>
    </div>
  )
}
