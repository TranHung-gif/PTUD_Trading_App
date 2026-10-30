import React from 'react'

export function StockMark({ symbol }: { symbol: string }) {
  return (
    <div className="stock-mark">
      <span>{symbol.slice(0, 1)}</span>
    </div>
  )
}

