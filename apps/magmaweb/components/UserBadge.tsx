'use client'

import { getUserColors } from '../lib/userColor'

type Props = {
  username: string
  size?: number
}

export default function UserBadge({ username, size = 24 }: Props) {
  const { bg, fg } = getUserColors(username)

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: bg,
        color: fg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: Math.floor(size * 0.5),
        fontWeight: 600,
        flexShrink: 0,
        userSelect: 'none',
      }}
    >
      {username[0]?.toUpperCase()}
    </div>
  )
}
