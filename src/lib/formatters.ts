/**
 * Format a number with commas: 1234567 → "1,234,567"
 */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(n)
}

/**
 * Format seconds as "Xm Ys" — e.g. 125 → "2m 5s"
 */
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  if (m === 0) return `${s}s`
  return `${m}m ${s}s`
}

/**
 * Format a percentage: 0.3456 → "34.6%"
 */
export function formatPercent(ratio: number): string {
  return `${(ratio * 100).toFixed(1)}%`
}

/**
 * Capitalise first letter of each word
 */
export function titleCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase())
}
