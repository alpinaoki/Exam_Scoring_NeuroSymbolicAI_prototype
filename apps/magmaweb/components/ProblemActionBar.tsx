// components/ProblemActionBar.tsx
'use client'

import { uploadImageToCloudinary } from '../lib/upload'
import { createAnswer } from '../lib/posts'

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
    <div style={{ display: 'flex', gap: 16 }}>
      <span>❤ {bookmarkCount}</span>

      <label style={{ cursor: 'pointer' }}>
        💬 {answerCount}
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
