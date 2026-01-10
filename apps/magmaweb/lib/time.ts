export function formatDateTime(createdAt: string) {
  const now = new Date()
  const created = new Date(createdAt)

  const diffMs = now.getTime() - created.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHour = Math.floor(diffMin / 60)

  // 24時間以内 → 相対時間
  if (diffMin < 60) {
    return `${diffMin}分前`
  }

  if (diffHour < 24) {
    return `${diffHour}時間前`
  }

  // 24時間超 → 絶対時刻
  return created.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
