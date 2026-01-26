import {
  Heart,
  Star,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react'

export default function ReactionIcon({
  type,
}: {
  type: string
}) {
  switch (type) {
    case 'heart':
      return <Heart size={18} color="#e25555" />
    case 'star':
      return <Star size={18} color="#f5b301" />
    case 'exclamation':
      return <AlertTriangle size={18} color="#e67e22" />
    case 'question':
      return <HelpCircle size={18} color="#3498db" />
    default:
      return null
  }
}
