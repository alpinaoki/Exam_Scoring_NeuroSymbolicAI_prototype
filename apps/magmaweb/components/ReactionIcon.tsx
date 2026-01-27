import {
  Star,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react'

type ReactionIconProps = {
  type: string
  size?: number
  color?: string
  fillColor?: string
}

export default function ReactionIcon({
  type,
  size = 18,
  color = '#000',
  fillColor = 'none'
}: ReactionIconProps) {
  
  const iconProps = {
    size,
    color,
    fill: fillColor,
    strokeWidth: 2.5, // 2.5~3.0くらいが塗りつぶした時にクッキリします
  }

  switch (type) {
    case 'star': return <Star {...iconProps} />
    case 'exclamation': return <AlertTriangle {...iconProps} />
    case 'question': return <HelpCircle {...iconProps} />
    default: return null
  }
}