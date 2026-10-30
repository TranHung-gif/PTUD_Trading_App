import React, { useState, useEffect } from 'react'
import { Bell, CheckCircle2, ArrowUpRight, Search, X } from 'lucide-react'
import { stockApi } from '../../services/api.js'
import { StockMark } from '../common/StockMark.js'
import { formatVnd } from '../../utils/format.js'
import { useLanguage } from '../../context/LanguageContext.js'
import type { Stock } from '../../types/index.js'

interface HeaderProps {
  page: string
  cashBalance: number
  onSelectStock: (stock: Stock) => void
  onNavigate: (page: string) => void
}

export function Header({
  page,
  cashBalance,
  onSelectStock,
  onNavigate,
}: HeaderProps) {
  const { t, language } = useLanguage()
  const [globalQuery, setGlobalQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Stock[]>([])
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  useEffect(() => {
    if (!globalQuery.trim()) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      try {
        const stocks = await stockApi.getStocks(globalQuery)
        setSearchResults(stocks)
      } catch {
        setSearchResults([])
      }
    }, 250)

    return () => clearTimeout(timer)
  }, [globalQuery])

  const getPageTitle = (p: string) => {
    switch (p) {
      case 'Tổng quan':
        return t('nav_overview')
      case 'Giao dịch':
        return t('nav_trading')
      case 'Danh mục':
        return t('nav_portfolio')
      case 'Lệnh của tôi':
        return t('nav_orders')
      case 'Cài đặt':
        return t('nav_settings')
      default:
        return p
    }
  }

  const currentDateStr =
    language === 'en' ? 'Wednesday, June 18' : 'Thứ tư, 18 tháng 6'

  return (
    <header>
      <div className="header-title">
        <small>{currentDateStr}</small>
        <h1>{getPageTitle(page)}</h1>
      </div>

      <div className="header-actions">
        <div className="global-search-wrap">
          <label className="search-global">
            <Search size={17} />
            <input
              value={globalQuery}
              onChange={(e) => setGlobalQuery(e.target.value)}
              placeholder={t('search_stock')}
            />
            <kbd>⌘ K</kbd>
          </label>

          {searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map((stock) => (
                <button
                  key={stock.symbol}
                  onClick={() => {
                    onSelectStock(stock)
                    onNavigate('Giao dịch')
                    setGlobalQuery('')
                  }}
                >
                  <StockMark symbol={stock.symbol} />
                  <span>
                    <b>{stock.symbol}</b>
                    <small>{stock.name}</small>
                  </span>
                  <em>{formatVnd(stock.price)}</em>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="notification-wrap">
          <button
            onClick={() => setNotificationsOpen((open) => !open)}
            className="icon-button"
          >
            <Bell size={19} />
            <span className="alert-dot" />
          </button>

          {notificationsOpen && (
            <div className="notification-panel">
              <div className="notification-head">
                <div>
                  <b>{t('notifications')}</b>
                  <small>3 {t('new_notices')}</small>
                </div>
                <button onClick={() => setNotificationsOpen(false)}>
                  <X size={15} />
                </button>
              </div>

              <button
                onClick={() => {
                  onNavigate('Giao dịch')
                  setNotificationsOpen(false)
                }}
                className="notification-item unread"
              >
                <span className="notice-icon success">
                  <ArrowUpRight size={15} />
                </span>
                <div>
                  <b>FPT tăng mạnh 2,36%</b>
                  <p>Mã trong watchlist vừa vượt 134.000 ₫.</p>
                  <small>2 phút trước</small>
                </div>
              </button>

              <button
                onClick={() => {
                  onNavigate('Lệnh của tôi')
                  setNotificationsOpen(false)
                }}
                className="notification-item unread"
              >
                <span className="notice-icon">
                  <CheckCircle2 size={15} />
                </span>
                <div>
                  <b>Lệnh HPG đã khớp</b>
                  <p>500 cổ phiếu khớp tại giá 26.750 ₫.</p>
                  <small>18 phút trước</small>
                </div>
              </button>

              <button
                onClick={() => {
                  onNavigate('Lệnh của tôi')
                  setNotificationsOpen(false)
                }}
                className="notification-item"
              >
                <span className="notice-icon warning">
                  <Bell size={15} />
                </span>
                <div>
                  <b>Phiên ATC sắp bắt đầu</b>
                  <p>Kiểm tra lại các lệnh đang chờ của bạn.</p>
                  <small>1 giờ trước</small>
                </div>
              </button>

              <button
                className="view-all"
                onClick={() => {
                  onNavigate('Lệnh của tôi')
                  setNotificationsOpen(false)
                }}
              >
                {t('view_all_activities')}
              </button>
            </div>
          )}
        </div>

        <div className="balance">
          <small>{t('purchasing_power')}</small>
          <b>{formatVnd(cashBalance)} ₫</b>
        </div>
      </div>
    </header>
  )
}
