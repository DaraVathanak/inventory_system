export function currency(n: number | string) {
  return `$${Number(n || 0).toLocaleString()}`
}

export function daysUntil(dateString: string) {
  const ts = new Date(dateString).getTime()
  if (Number.isNaN(ts)) return Number.POSITIVE_INFINITY
  const diff = ts - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function isExpiringSoon(dateString: string, threshold = 90) {
  return daysUntil(dateString) <= threshold
}