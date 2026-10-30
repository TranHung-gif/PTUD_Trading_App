import React, { useState, useMemo } from 'react'
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronDown,
  ListFilter,
  Search,
  Star,
} from 'lucide-react'
import { StockMark } from '../components/common/StockMark.js'
import { formatVnd } from '../utils/format.js'
import { orderApi, watchlistApi } from '../services/api.js'
import { useAuth } from '../context/AuthContext.js'
import type { Stock } from '../types/index.js'

interface TradingProps {
  stocks: Stock[]
  watchlistSymbols: string[]
  selectedStock: Stock
  cashBalance: number
  tickDirections?: Record<string, 'up' | 'down'>
  onSelectStock: (stock: Stock) => void
  onUpdateWatchlist: (symbols: string[]) => void
  onOrderPlaced: () => void
  onRequireAuth: () => void
  flash: (msg: string) => void
}

const defaultCandles = [
  [22, 36, 18, 30], [31, 45, 27, 42], [42, 48, 32, 35], [35, 41, 25, 29],
  [29, 39, 26, 37], [37, 51, 34, 47], [47, 55, 40, 43], [43, 49, 33, 36],
  [36, 45, 30, 41], [41, 53, 38, 50], [50, 61, 45, 57], [57, 65, 51, 54],
  [54, 63, 47, 60], [60, 72, 57, 69], [69, 75, 62, 65], [65, 78, 61, 73],
  [73, 81, 68, 77], [77, 84, 70, 72], [72, 82, 69, 80], [80, 90, 75, 87],
  [87, 94, 80, 83], [83, 91, 76, 79], [79, 89, 74, 86], [86, 96, 82, 93],
]

export function Trading({
  stocks,
  watchlistSymbols,
  selectedStock,
  cashBalance,
  tickDirections = {},
  onSelectStock,
  onUpdateWatchlist,
  onOrderPlaced,
  onRequireAuth,
  flash,
}: TradingProps) {
  const { isAuthenticated } = useAuth()
  const [side, setSide] = useState<'buy' | 'sell'>('buy')
  const [quantity, setQuantity] = useState('100')
  const [range, setRange] = useState('1D')
  const [query, setQuery] = useState('')
  const [watchSort, setWatchSort] = useState<'default' | 'change'>('default')
  const [orderType, setOrderType] = useState('LO')
  const [submitting, setSubmitting] = useState(false)

  const visibleStocks = useMemo(() => {
    return stocks
      .filter((item) => watchlistSymbols.includes(item.symbol))
      .filter((item) =>
        `${item.symbol} ${item.name}`.toLowerCase().includes(query.toLowerCase()),
      )
      .sort((a, b) =>
        watchSort === 'change'
          ? b.change - a.change
          : watchlistSymbols.indexOf(a.symbol) - watchlistSymbols.indexOf(b.symbol),
      )
  }, [stocks, watchlistSymbols, query, watchSort])

  const total = useMemo(
    () => (Number(quantity) || 0) * selectedStock.price,
    [quantity, selectedStock.price],
  )

  const handlePlaceOrder = async () => {
    if (!Number(quantity) || Number(quantity) <= 0) {
      flash('Vui lòng nhập khối lượng hợp lệ')
      return
    }

    if (!isAuthenticated) {
      onRequireAuth()
      return
    }

    setSubmitting(true)
    try {
      const res = await orderApi.placeOrder({
        symbol: selectedStock.symbol,
        side: side === 'buy' ? 'Mua' : 'Bán',
        orderType,
        quantity: Number(quantity),
        price: selectedStock.price,
      })

      flash(
        `Đã khớp lệnh ${side === 'buy' ? 'mua' : 'bán'} ${quantity} ${selectedStock.symbol}!`,
      )
      onOrderPlaced()
    } catch (err) {
      flash((err as Error).message || 'Không thể đặt lệnh.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      onRequireAuth()
      return
    }
    try {
      const res = await watchlistApi.toggleWatchlist(selectedStock.symbol)
      onUpdateWatchlist(res.symbols)
      flash(
        res.isFavorite
          ? `Đã thêm ${res.symbol} vào watchlist`
          : `Đã bỏ ${res.symbol} khỏi watchlist`,
      )
    } catch (err) {
      flash((err as Error).message || 'Không thể cập nhật danh sách theo dõi')
    }
  }

  const handleAddNextStock = async () => {
    const next = stocks.find((s) => !watchlistSymbols.includes(s.symbol))
    if (!next) {
      flash('Tất cả mã cổ phiếu đã có trong danh sách theo dõi')
      return
    }
    if (!isAuthenticated) {
      onRequireAuth()
      return
    }
    try {
      const res = await watchlistApi.toggleWatchlist(next.symbol)
      onUpdateWatchlist(res.symbols)
      flash(`Đã thêm ${next.symbol} vào watchlist`)
    } catch (err) {
      flash((err as Error).message || 'Không thể thêm mã cổ phiếu')
    }
  }

  const candles = selectedStock.candles?.length
    ? selectedStock.candles
    : defaultCandles

  return (
    <section className="workspace">
      {/* 1. Watchlist */}
      <div className="watchlist panel">
        <div className="panel-heading">
          <div>
            <p>Danh sách theo dõi</p>
            <small>{watchlistSymbols.length} mã cổ phiếu</small>
          </div>
          <button
            title="Sắp xếp theo biến động"
            onClick={() =>
              setWatchSort((cur) => (cur === 'default' ? 'change' : 'default'))
            }
            className={`icon-button subtle ${watchSort === 'change' ? 'filter-active' : ''}`}
          >
            <ListFilter size={17} />
          </button>
        </div>

        <label className="stock-search">
          <Search size={16} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm..."
          />
        </label>

        <div className="stock-list">
          {visibleStocks.map((stock) => {
            const dir = tickDirections[stock.symbol]
            const flashClass = dir === 'up' ? 'tick-flash-up' : dir === 'down' ? 'tick-flash-down' : ''
            return (
              <button
                key={stock.symbol}
                className={`${
                  selectedStock.symbol === stock.symbol
                    ? 'stock-row selected'
                    : 'stock-row'
                } ${flashClass}`}
                onClick={() => onSelectStock(stock)}
              >
                <StockMark symbol={stock.symbol} />
                <div className="stock-name">
                  <b>{stock.symbol}</b>
                  <small>{stock.name}</small>
                </div>
                <div className="stock-price">
                  <b>{formatVnd(stock.price)}</b>
                  <span className={stock.change > 0 ? 'positive' : 'negative'}>
                    {stock.change > 0 ? '+' : ''}
                    {stock.change.toFixed(2)}%
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        <button onClick={handleAddNextStock} className="add-stock">
          + Thêm mã cổ phiếu
        </button>
      </div>

      {/* 2. Chart Panel */}
      <div className="chart-panel panel">
        <div className="stock-overview">
          <div className="stock-title">
            <StockMark symbol={selectedStock.symbol} />
            <div>
              <span>{selectedStock.symbol}</span>
              <small>
                {selectedStock.exchange || 'HOSE'} · {selectedStock.name}
              </small>
            </div>
            <button
              onClick={handleToggleFavorite}
              title="Thêm hoặc bỏ khỏi watchlist"
              className={`star ${watchlistSymbols.includes(selectedStock.symbol) ? 'active' : ''}`}
            >
              <Star
                size={17}
                fill={
                  watchlistSymbols.includes(selectedStock.symbol)
                    ? 'currentColor'
                    : 'none'
                }
              />
            </button>
          </div>
          <div
            className={`quote ${
              tickDirections[selectedStock.symbol] === 'up'
                ? 'tick-flash-up'
                : tickDirections[selectedStock.symbol] === 'down'
                  ? 'tick-flash-down'
                  : ''
            }`}
            style={{ borderRadius: '6px', padding: '2px 6px' }}
          >
            <div>
              <strong>{formatVnd(selectedStock.price)}</strong>
              <small>VND</small>
            </div>
            <span
              className={
                selectedStock.change > 0 ? 'positive badge' : 'negative badge'
              }
            >
              {selectedStock.change > 0 ? (
                <ArrowUpRight size={15} />
              ) : (
                <ArrowDownRight size={15} />
              )}
              {Math.abs(selectedStock.change).toFixed(2)}% hôm nay
            </span>
          </div>
        </div>

        <div className="chart-toolbar">
          <div className="ranges">
            {['1D', '1W', '1M', '3M', '1Y'].map((item) => (
              <button
                className={range === item ? 'active' : ''}
                onClick={() => setRange(item)}
                key={item}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="ohlc">
            <span>
              O <b>{((selectedStock.open || selectedStock.price) / 1000).toFixed(1)}</b>
            </span>
            <span>
              H <b>{((selectedStock.high || selectedStock.price) / 1000).toFixed(1)}</b>
            </span>
            <span>
              L <b>{((selectedStock.low || selectedStock.price) / 1000).toFixed(1)}</b>
            </span>
            <span>
              C <b>{((selectedStock.close || selectedStock.price) / 1000).toFixed(1)}</b>
            </span>
          </div>
        </div>

        <div className="chart">
          <div className="price-axis">
            <span>136</span>
            <span>134</span>
            <span>132</span>
            <span>130</span>
            <span>128</span>
          </div>
          <div className="grid-lines">
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
          <div className="candles">
            {candles.map(([open, high, low, close], i) => {
              const up = close >= open
              const scale = (v: number) => 100 - v
              return (
                <div className="candle-slot" key={i}>
                  <span
                    className={up ? 'wick up' : 'wick down'}
                    style={{
                      top: `${scale(high)}%`,
                      height: `${high - low}%`,
                    }}
                  />
                  <span
                    className={up ? 'body up' : 'body down'}
                    style={{
                      top: `${scale(Math.max(open, close))}%`,
                      height: `${Math.max(3, Math.abs(close - open))}%`,
                    }}
                  />
                </div>
              )
            })}
          </div>
          <div className="current-line">
            <span>{(selectedStock.price / 1000).toFixed(1)}</span>
          </div>
          <div className="time-axis">
            <span>09:00</span>
            <span>10:00</span>
            <span>11:00</span>
            <span>13:00</span>
            <span>14:00</span>
          </div>
        </div>

        <div className="chart-footer">
          <div>
            <small>KL hôm nay</small>
            <b>{((selectedStock.volume || 3840000) / 1000000).toFixed(2)} triệu</b>
          </div>
          <div>
            <small>Giá trị GD</small>
            <b>{((selectedStock.valueTraded || 512400000000) / 1000000000).toFixed(1)} tỷ</b>
          </div>
          <div>
            <small>Cao nhất 52T</small>
            <b>{formatVnd(selectedStock.high52w || 142800)}</b>
          </div>
          <div>
            <small>Thấp nhất 52T</small>
            <b>{formatVnd(selectedStock.low52w || 82600)}</b>
          </div>
        </div>
      </div>

      {/* 3. Order Panel */}
      <aside className="order-panel panel">
        <div className="order-tabs">
          <button
            className={side === 'buy' ? 'active buy' : ''}
            onClick={() => setSide('buy')}
          >
            Mua
          </button>
          <button
            className={side === 'sell' ? 'active sell' : ''}
            onClick={() => setSide('sell')}
          >
            Bán
          </button>
        </div>

        <div className="order-body">
          <label>
            <span>Loại lệnh</span>
            <button
              onClick={() =>
                setOrderType((cur) =>
                  cur === 'LO' ? 'ATO' : cur === 'ATO' ? 'ATC' : 'LO',
                )
              }
              className="select-like"
            >
              Lệnh{' '}
              {orderType === 'LO'
                ? 'giới hạn'
                : orderType === 'ATO'
                  ? 'mở cửa'
                  : 'đóng cửa'}{' '}
              ({orderType})
              <ChevronDown size={16} />
            </button>
          </label>

          <label>
            <span>Giá đặt</span>
            <div className="input-like">
              <input value={formatVnd(selectedStock.price)} readOnly />
              <small>VND</small>
            </div>
          </label>

          <label>
            <span>Khối lượng</span>
            <div className="input-like">
              <input
                value={quantity}
                onChange={(e) => setQuantity(e.target.value.replace(/\D/g, ''))}
              />
              <small>Cổ phiếu</small>
            </div>
          </label>

          <div className="percent-row">
            {['25%', '50%', '75%', '100%'].map((x) => (
              <button
                key={x}
                onClick={() => {
                  const percent = Number(x.slice(0, -1)) / 100
                  const calculatedQty =
                    Math.floor((cashBalance * percent) / selectedStock.price / 100) * 100
                  setQuantity(String(Math.max(100, calculatedQty)))
                }}
              >
                {x}
              </button>
            ))}
          </div>

          <div className="order-summary">
            <div>
              <span>Giá trị lệnh</span>
              <b>{formatVnd(total)} ₫</b>
            </div>
            <div>
              <span>Phí giao dịch (0,15%)</span>
              <b>{formatVnd(total * 0.0015)} ₫</b>
            </div>
            <hr />
            <div className="total">
              <span>Tổng thanh toán</span>
              <strong>{formatVnd(total * 1.0015)} ₫</strong>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={submitting}
            className={`submit-order ${side}`}
          >
            {submitting
              ? 'Đang xử lý...'
              : `${side === 'buy' ? 'Đặt lệnh mua' : 'Đặt lệnh bán'} ${selectedStock.symbol}`}
          </button>
          <p className="order-note">
            Lệnh của bạn sẽ được gửi tới HOSE và ghi nhận vào MongoDB.
          </p>
        </div>
      </aside>
    </section>
  )
}

