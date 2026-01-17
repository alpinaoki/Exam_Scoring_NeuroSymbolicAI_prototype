'use client'

import { getUserColors } from '../lib/userColor'
import {
  Cat,
  Dog,
  Rabbit,
  Bird,
  Fish,
  Turtle,
  PawPrint,
  Flower,
  Leaf,
  Clover,
  Sparkles,
  Sun,
  MoonStar,
} from 'lucide-react'

type Props = {
  username: string
  size?: number
}

const ICONS = [
  Cat,
  Dog,
  Rabbit,
  Bird,
  Fish,
  Turtle,
  PawPrint,
  Flower,
  Leaf,
  Clover,
  Sparkles,
  Sun,
  MoonStar,
]

function hashString(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export default function UserBadge({ username, size = 24 }: Props) {
  const { bg, fg } = getUserColors(username)

  const index = hashString(username) % ICONS.length
  const Icon = ICONS[index]

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
        flexShrink: 0,
        userSelect: 'none',
      }}
    >
      <Icon size={Math.floor(size * 0.6)} strokeWidth={2} />
    </div>
  )
}
