import React, { useState, useEffect, useCallback } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { AuthProvider, useAuth } from './context/AuthContext.js'
import { LanguageProvider } from './context/LanguageContext.js'
import { Sidebar } from './components/layout/Sidebar.js'
import { Header } from './components/layout/Header.js'
import { MarketStrip } from './components/layout/MarketStrip.js'
import { AuthModal } from './components/auth/AuthModal.js'
import { Overview } from './pages/Overview.js'
import { Trading } from './pages/Trading.js'
import { Portfolio } from './pages/Portfolio.js'
import { Orders } from './pages/Orders.js'
import { Settings } from './pages/Settings.js'
import {
  stockApi,
  portfolioApi,
  orderApi,
  watchlistApi,
  connectLiveStockStream,
} from './services/api.js'
import type { Stock, PortfolioData, Order, MarketIndex } from './types/index.js'

// Dữ liệu fallback dự phòng
const fallbackStocks: Stock[] = [
  {
    _id: '1',
    symbol: 'FPT',
    name: 'FPT Corporation',
    exchange: 'HOSE',
    price: 134500,
    change: 2.36,
    open: 131400,
    high: 135200,
    low: 130800,
    close: 134500,
    volume: 3840000,
    valueTraded: 512400000000,
    high52w: 142800,
    low52w: 82600,
    color: '#28d79f',
    sector: 'Công nghệ',
    candles: [],
  },
  {
    _id: '2',
    symbol: 'VNM',
    name: 'Vinamilk',
    exchange: 'HOSE',
    price: 68500,
    change: -0.72,
    open: 69000,
    high: 69400,
    low: 68100,
    close: 68500,
    volume: 1950000,
    valueTraded: 133575000000,
    high52w: 75500,
    low52w: 63200,
    color: '#ff6b72',
    sector: 'Tiêu dùng',
    candles: [],
  },
  {
    _id: '3',
    symbol: 'HPG',
    name: 'Hòa Phát Group',
    exchange: 'HOSE',
    price: 26750,
    change: 1.52,
    open: 26350,
    high: 27100,
    low: 26200,
    close: 26750,
    volume: 18240000,
    valueTraded: 487920000000,
    high52w: 31200,
    low52w: 24100,
    color: '#28d79f',
    sector: 'Sản xuất',
    candles: [],
  },
  {
    _id: '4',
    symbol: 'VIC',
    name: 'Vingroup',
    exchange: 'HOSE',
    price: 41800,
    change: -1.18,
    open: 42300,
    high: 42500,
    low: 41500,
    close: 41800,
    volume: 2450000,
    valueTraded: 102410000000,
    high52w: 48900,
    low52w: 39500,
    color: '#ff6b72',
    sector: 'Bất động sản',
    candles: [],
  },
  {
    _id: '5',
    symbol: 'MWG',
    name: 'Mobile World',
    exchange: 'HOSE',
    price: 62400,
    change: 3.14,
    open: 60500,
    high: 62800,
    low: 60200,
    close: 62400,
    volume: 5120000,
    valueTraded: 319488000000,
    high52w: 68500,
    low52w: 43200,
    color: '#28d79f',
    sector: 'Bán lẻ',
    candles: [],
  },
]

function MainApp() {
  const { isAuthenticated } = useAuth()
  const [page, setPage] = useState('Tổng quan')
  const [darkMode, setDarkMode] = useState(true)
  const [notice, setNotice] = useState('')
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')

  // Dữ liệu từ API Backend
  const [stocks, setStocks] = useState<Stock[]>(fallbackStocks)
  const [selectedStock, setSelectedStock] = useState<Stock>(fallbackStocks[0])
  const [watchlistSymbols, setWatchlistSymbols] = useState<string[]>([
    'FPT',
    'VNM',
    'HPG',
    'VIC',
  ])
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null)
  const [orders, setOrders] = useState<Order[]>([])

  // State Real-time Ticker
  const [tickDirections, setTickDirections] = useState<Record<string, 'up' | 'down'>>({})
  const [liveIndices, setLiveIndices] = useState<MarketIndex[] | undefined>()
  const [isLiveMarket, setIsLiveMarket] = useState(false)

  const flash = (message: string) => {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 2600)
  }

  // 1. Tải danh sách cổ phiếu
  const loadStocks = useCallback(async () => {
    try {
      const data = await stockApi.getStocks()
      if (data && data.length > 0) {
        setStocks(data)
        setSelectedStock((prev) => data.find((s) => s.symbol === prev.symbol) || data[0])
      }
    } catch {
      // Giữ fallback nếu server chưa bật
    }
  }, [])

  // 2. Tải Watchlist
  const loadWatchlist = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      const data = await watchlistApi.getWatchlist()
      if (data?.symbols) {
        setWatchlistSymbols(data.symbols)
      }
    } catch {}
  }, [isAuthenticated])

  // 3. Tải Portfolio
  const loadPortfolio = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      const data = await portfolioApi.getPortfolio()
      setPortfolio(data)
    } catch {}
  }, [isAuthenticated])

  // 4. Tải Orders
  const loadOrders = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      const data = await orderApi.getOrders()
      setOrders(data)
    } catch {}
  }, [isAuthenticated])

  useEffect(() => {
    loadStocks()
  }, [loadStocks])

  // Lắng nghe dữ liệu giá Real-time từ SSE Server
  useEffect(() => {
    const disconnect = connectLiveStockStream((payload) => {
      if (payload.stocks && payload.stocks.length > 0) {
        setStocks(payload.stocks)
        setSelectedStock((prev) => payload.stocks.find((s) => s.symbol === prev.symbol) || prev)

        // Tạo direction flash cho các mã có biến động giá
        const dirs: Record<string, 'up' | 'down'> = {}
        for (const s of payload.stocks) {
          if (s.direction === 'up' || s.direction === 'down') {
            dirs[s.symbol] = s.direction
          }
        }
        setTickDirections(dirs)

        // Tự động clear flash sau 1.2s để sẵn sàng cho tick kế tiếp
        setTimeout(() => {
          setTickDirections({})
        }, 1200)
      }

      if (payload.indices) {
        setLiveIndices(payload.indices)
      }
      setIsLiveMarket(payload.isLiveMarket)
    })

    return () => disconnect()
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      loadWatchlist()
      loadPortfolio()
      loadOrders()
    } else {
      setPortfolio(null)
      setOrders([])
    }
  }, [isAuthenticated, loadWatchlist, loadPortfolio, loadOrders])

  const pendingOrdersCount = orders.filter((o) => o.status === 'Chờ khớp').length
  const cashBalance = portfolio?.cashBalance ?? 125680000

  return (
    <div className={`app-shell ${darkMode ? '' : 'soft-theme'}`}>
      <Sidebar
        page={page}
        setPage={setPage}
        onOpenAuth={(mode) => {
          setAuthMode(mode)
          setAuthOpen(true)
        }}
        flash={flash}
      />

      <main>
        <Header
          page={page}
          cashBalance={cashBalance}
          onSelectStock={(stock) => setSelectedStock(stock)}
          onNavigate={(targetPage) => setPage(targetPage)}
        />

        <MarketStrip
          liveIndices={liveIndices}
          isLiveMarket={isLiveMarket}
        />

        {page === 'Tổng quan' && (
          <Overview
            portfolio={portfolio}
            pendingOrdersCount={pendingOrdersCount}
            onNavigate={(target) => setPage(target)}
          />
        )}

        {page === 'Giao dịch' && (
          <Trading
            stocks={stocks}
            watchlistSymbols={watchlistSymbols}
            selectedStock={selectedStock}
            cashBalance={cashBalance}
            tickDirections={tickDirections}
            onSelectStock={(stock) => setSelectedStock(stock)}
            onUpdateWatchlist={(symbols) => setWatchlistSymbols(symbols)}
            onOrderPlaced={() => {
              loadPortfolio()
              loadOrders()
            }}
            onRequireAuth={() => {
              setAuthMode('login')
              setAuthOpen(true)
            }}
            flash={flash}
          />
        )}

        {page === 'Danh mục' && (
          <Portfolio
            portfolio={portfolio}
            onNavigate={(target) => setPage(target)}
          />
        )}

        {page === 'Lệnh của tôi' && (
          <Orders
            orders={orders}
            onNavigate={(target) => setPage(target)}
            onOrderUpdated={() => {
              loadOrders()
              loadPortfolio()
            }}
            flash={flash}
          />
        )}

        {page === 'Cài đặt' && (
          <Settings
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            flash={flash}
          />
        )}
      </main>

      {notice && (
        <div className="toast">
          <CheckCircle2 size={17} />
          {notice}
        </div>
      )}

      {authOpen && (
        <AuthModal
          initialMode={authMode}
          onClose={() => setAuthOpen(false)}
          onSuccess={(name) => {
            flash(`Xin chào, ${name}!`)
            loadPortfolio()
            loadOrders()
            loadWatchlist()
          }}
          flash={flash}
        />
      )}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <MainApp />
      </LanguageProvider>
    </AuthProvider>
  )
}
