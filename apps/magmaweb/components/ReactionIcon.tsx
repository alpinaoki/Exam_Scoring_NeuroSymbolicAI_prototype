import {
  Star,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react'

// プロパティの型定義を追加
type ReactionIconProps = {
  type: string
  size?: number
  color?: string
  fillColor?: string
}

export default function ReactionIcon({
  type,
  size = 18,       // デフォルトサイズ
  color = '#000',  // デフォルトの線の色
  fillColor = 'none' // デフォルトの塗りつぶし
}: ReactionIconProps) {
  
  // Lucideアイコンに渡す共通設定
  const iconProps = {
    size,
    color,
    fill: fillColor,
    strokeWidth: 2.5, // 視認性を高めるために線を少し太く
  }

  switch (type) {
    case 'star':
      return <Star {...iconProps} />
    case 'exclamation':
      return <AlertTriangle {...iconProps} />
    case 'question':
      return <HelpCircle {...iconProps} />
    default:
      return null
  }
}