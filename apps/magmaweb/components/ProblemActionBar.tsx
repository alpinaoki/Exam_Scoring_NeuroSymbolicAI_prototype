'use client'

import { uploadAnswerImage } from '../lib/upload'

type Props = {
  problemId: string
  bookmarkCount: number
  answerCount: number
}

export default function ProblemActionBar({
  problemId,
  bookmarkCount,
  answerCount,
}: Props) {
  return (
    <div style={{ display: 'flex', gap: 16 }}>
      <span>:しおり: {bookmarkCount}</span>

      <label style={{ cursor: 'pointer' }}>
        :入力中アイコン: {answerCount}
        <input
          type="file"
          accept="image/*"
          hidden
          onChange={async (e) => {
            const file = e.target.files?.[0]
            if (!file) return
            await uploadAnswerImage(file, problemId)
            alert('提出完了')
          }}
        />
      </label>
    </div>
  )
}
