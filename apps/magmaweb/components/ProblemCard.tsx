'use client'
import { useState } from 'react'
import type { CSSProperties } from 'react'
import ProblemActionBar from './ProblemActionBar'
type Props = {
  image: string
}
export default function ProblemCard({ image }: Props) {
  const [preview, setPreview] = useState<string | null>(null)
  return (
    <div style={styles.card}>
      <img src={image} alt="problem" style={styles.image} />
      {preview && (
        <img
          src={preview}
          alt="answer preview"
          style={styles.preview}
        />
      )}
      <ProblemActionBar
        problemID={image} //仮
        bookmarkCount={12}
        answerCount={3}
        }
      />
    </div>
  )
}
const styles: { [key: string]: CSSProperties } = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  image: {
    width: '100%',
    borderRadius: '8px',
    border: '1px solid #eee',
  },
  preview: {
    width: '100%',
    borderRadius: '8px',
    border: '2px solid #e53935',
  },
}






