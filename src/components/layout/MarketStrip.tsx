import React, { useEffect, useState } from 'react'
import { stockApi } from '../../services/api.js'
import type { MarketIndex } from '../../types/index.js'

interface MarketStripProps {
  liveIndices?: MarketIndex[]
  isLiveMarket?: boolean
}

export function MarketStrip({ liveIndices, isLiveMarket = false }: MarketStripProps) {
  const [indices, setIndices] = useState<MarketIndex[]>([
    { name: 'VN-INDEX', value: '1.347,14', change: '+0,62%', isPositive: true },
    { name: 'VN30', value: '1.439,63', change: '+0,48%', isPositive: true },
    { name: 'HNX-INDEX', value: '228,91', change: '-0,15%', isPositive: false },
  ])

  useEffect(() => {
    if (liveIndices && liveIndices.length > 0) {
      setIndices(liveIndices)
    }
  }, [liveIndices])

  useEffect(() => {
    if (!liveIndices) {
      stockApi
        .getMarketIndices()
        .then((data) => setIndices(data))
        .catch(() => {})
    }
  }, [liveIndices])

  return (
    <div className="market-strip">
      {indices.map(({ name, value, change, isPositive }) => (
        <div className="index-item" key={name}>
          <span>{name}</span>
          <b>{value}</b>
          <em className={isPositive ? 'positive' : 'negative'}>{change}</em>
          <svg viewBox="0 0 60 22" aria-hidden="true">
            <polyline
              points={
                isPositive
                  ? '0,17 10,14 20,16 30,8 40,11 50,4 60,6'
                  : '0,5 10,8 20,6 30,14 40,11 50,17 60,15'
              }
            />
          </svg>
        </div>
      ))}
      <div className="live" title={isLiveMarket ? 'Sàn HOSE đang mở cửa' : 'Chế độ Real-time Simulator'}>
        <span className="live-badge-pulse" />
        {isLiveMarket ? 'Sàn trực tiếp (HOSE)' : 'Dữ liệu trực tiếp (Live)'}
      </div>
    </div>
  )
}
