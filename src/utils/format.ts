export function formatVnd(value: number): string {
  return new Intl.NumberFormat('vi-VN').format(Math.round(value))
}

export function formatPercent(value: number): string {
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

