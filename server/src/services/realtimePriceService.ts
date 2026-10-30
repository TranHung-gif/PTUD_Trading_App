import { Response } from 'express'
import Stock from '../models/Stock.js'

interface ClientConnection {
  id: string
  res: Response
}

let clients: ClientConnection[] = []
let intervalId: NodeJS.Timeout | null = null

// Danh sách các mã cổ phiếu đang theo dõi realtime
const SYMBOLS = ['FPT', 'VNM', 'HPG', 'VIC', 'MWG', 'TCB']

// Kiểm tra có đang trong giờ giao dịch HOSE không (9:00 - 15:00 Thứ 2 - Thứ 6)
function isTradingHours(): boolean {
  const now = new Date()
  const day = now.getDay() // 0: CN, 6: T7
  const hour = now.getHours()
  const minute = now.getMinutes()
  const timeNum = hour * 100 + minute

  // Không phải cuối tuần và từ 9h00 tới 15h00
  return day >= 1 && day <= 5 && timeNum >= 900 && timeNum <= 1500
}

// Lấy giá từ API VNDIRECT thật
async function fetchRealPricesFromVNDirect(): Promise<Map<string, { price: number; change: number; volume: number }> | null> {
  try {
    const query = `code:${SYMBOLS.join(',')}`
    const url = `https://finfo-api.vndirect.com.vn/v4/stocks?q=${encodeURIComponent(query)}`

    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'application/json',
      },
    })

    if (!response.ok) return null
    const json = (await response.json()) as any
    if (!json?.data || !Array.isArray(json.data)) return null

    const map = new Map<string, { price: number; change: number; volume: number }>()
    for (const item of json.data) {
      if (item.code && item.matchPrice) {
        map.set(item.code, {
          price: item.matchPrice,
          change: item.priceChangeRatio || 0,
          volume: item.totalVolume || 0,
        })
      }
    }
    return map
  } catch {
    return null
  }
}

// Cập nhật giá và broadcast tới tất cả client đang kết nối
async function updateAndBroadcastPrices() {
  if (clients.length === 0) return

  try {
    const isLiveMarket = isTradingHours()
    const vndirectData = isLiveMarket ? await fetchRealPricesFromVNDirect() : null

    const stocks = await Stock.find({ symbol: { $in: SYMBOLS } })
    const updatedStocks = []

    for (const stock of stocks) {
      let newPrice = stock.price
      let newChange = stock.change
      let newVolume = stock.volume

      if (vndirectData && vndirectData.has(stock.symbol)) {
        // 1. Nếu có dữ liệu VNDIRECT trực tiếp từ sàn
        const live = vndirectData.get(stock.symbol)!
        newPrice = live.price
        newChange = live.change
        newVolume = live.volume
      } else {
        // 2. Chế độ Micro-Tick Simulator (ngoài giờ giao dịch hoặc khi test)
        // Tạo biến động nhẹ từ -0.3% đến +0.3% quanh giá hiện tại
        const deltaPercent = (Math.random() - 0.48) * 0.4 // nhẹ thiên về ổn định
        const step = Math.round((stock.price * (deltaPercent / 100)) / 50) * 50 // Bước giá 50 VND
        if (step !== 0) {
          newPrice = Math.max(1000, stock.price + step)
          newChange = Number((stock.change + deltaPercent * 0.1).toFixed(2))
          newVolume = stock.volume + Math.floor(Math.random() * 2000) + 100
        }
      }

      const direction = newPrice > stock.price ? 'up' : newPrice < stock.price ? 'down' : 'neutral'

      stock.price = newPrice
      stock.change = newChange
      stock.volume = newVolume
      stock.close = newPrice
      if (newPrice > stock.high) stock.high = newPrice
      if (newPrice < stock.low && newPrice > 0) stock.low = newPrice

      // Cập nhật nến hiện tại (cột cuối cùng)
      if (stock.candles && stock.candles.length > 0) {
        const lastCandle = stock.candles[stock.candles.length - 1]
        // [Open, High, Low, Close] quy đổi tỉ lệ
        const relativeClose = Math.min(96, Math.max(20, Math.round(lastCandle[3] + (direction === 'up' ? 1 : direction === 'down' ? -1 : 0))))
        lastCandle[3] = relativeClose
        if (relativeClose > lastCandle[1]) lastCandle[1] = relativeClose
        if (relativeClose < lastCandle[2]) lastCandle[2] = relativeClose
      }

      await stock.save()

      updatedStocks.push({
        symbol: stock.symbol,
        name: stock.name,
        price: stock.price,
        change: stock.change,
        volume: stock.volume,
        direction,
        high: stock.high,
        low: stock.low,
        open: stock.open,
        close: stock.close,
        candles: stock.candles,
      })
    }

    // Biến động nhẹ chỉ số thị trường
    const vnIndexShift = (Math.random() - 0.49) * 0.4
    const vnIndexVal = (1347.14 + vnIndexShift).toFixed(2).replace('.', ',')

    const messagePayload = {
      type: 'TICK_UPDATE',
      isLiveMarket,
      timestamp: new Date().toISOString(),
      stocks: updatedStocks,
      indices: [
        { name: 'VN-INDEX', value: vnIndexVal, change: `${vnIndexShift >= 0 ? '+' : ''}${(0.62 + vnIndexShift * 0.05).toFixed(2).replace('.', ',')}%`, isPositive: vnIndexShift >= 0 },
        { name: 'VN30', value: '1.439,63', change: '+0,48%', isPositive: true },
        { name: 'HNX-INDEX', value: '228,91', change: '-0,15%', isPositive: false },
      ],
    }

    // Broadcast tới toàn bộ SSE clients
    const eventData = `data: ${JSON.stringify(messagePayload)}\n\n`
    for (const client of clients) {
      client.res.write(eventData)
    }
  } catch (error) {
    console.error('Lỗi broadcast realtime price:', error)
  }
}

// Khởi chạy vòng lặp broadcast định kỳ mỗi 3 giây
export function startRealtimeEngine() {
  if (intervalId) return

  intervalId = setInterval(() => {
    updateAndBroadcastPrices()
  }, 3000)

  console.log('⚡ Real-time Price Streaming Engine started (Interval: 3s)')
}

// Đăng ký client kết nối SSE
export function subscribeClient(res: Response): string {
  const clientId = `client_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  })

  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', clientId })}\n\n`)

  clients.push({ id: clientId, res })
  console.log(`🔌 Client connected to Realtime Stream: ${clientId} (Total: ${clients.length})`)

  return clientId
}

// Huỷ đăng ký client
export function unsubscribeClient(clientId: string) {
  clients = clients.filter((c) => c.id !== clientId)
  console.log(`🔌 Client disconnected: ${clientId} (Remaining: ${clients.length})`)
}
