import React from 'react'
import { StockMark } from '../components/common/StockMark.js'
import { formatVnd, formatPercent } from '../utils/format.js'
import type { PortfolioData } from '../types/index.js'

interface PortfolioProps {
  portfolio: PortfolioData | null
  onNavigate: (page: string) => void
}

export function Portfolio({ portfolio, onNavigate }: PortfolioProps) {
  const stockValue = portfolio?.stockValue ?? 360560000
  const totalProfit = portfolio?.totalProfit ?? 42780000
  const totalProfitPercent = portfolio?.totalProfitPercent ?? 13.46
  const todayProfit = portfolio?.todayProfit ?? 8640000
  const holdings = portfolio?.holdings ?? []

  return (
    <section className="page-content">
      <div className="portfolio-hero">
        <div>
          <small>TỔNG GIÁ TRỊ CỔ PHIẾU</small>
          <strong>{formatVnd(stockValue)} ₫</strong>
          <span className={totalProfit >= 0 ? 'positive' : 'negative'}>
            {totalProfit >= 0 ? '+' : ''}
            {formatVnd(totalProfit)} ₫ ({formatPercent(totalProfitPercent)})
          </span>
        </div>
        <div>
          <small>LÃI/LỖ HÔM NAY (ƯỚC TÍNH)</small>
          <b className={todayProfit >= 0 ? 'positive' : 'negative'}>
            {todayProfit >= 0 ? '+' : ''}
            {formatVnd(todayProfit)} ₫
          </b>
          <span>{todayProfit >= 0 ? '+2,46%' : '-1,2%'}</span>
        </div>
      </div>

      <div className="panel data-card">
        <div className="section-title">
          <div>
            <b>Tài sản đang nắm giữ</b>
            <small>{holdings.length} mã cổ phiếu trong tài khoản</small>
          </div>
          <button onClick={() => onNavigate('Giao dịch')}>+ Mua thêm</button>
        </div>

        <div className="data-table portfolio-table">
          <div className="table-row table-head">
            <span>MÃ CỔ PHIẾU</span>
            <span>KHỐI LƯỢNG</span>
            <span>GIÁ VỐN TB</span>
            <span>GIÁ HIỆN TẠI</span>
            <span>GIÁ TRỊ</span>
            <span>LÃI/LỖ</span>
          </div>

          {holdings.map((row) => (
            <div className="table-row" key={row.symbol}>
              <span className="symbol-cell">
                <StockMark symbol={row.symbol} />
                <b>{row.symbol}</b>
              </span>
              <span>{formatVnd(row.quantity)}</span>
              <span>{formatVnd(row.avgPrice)}</span>
              <span>{formatVnd(row.currentPrice)}</span>
              <span>{formatVnd(row.marketValue)}</span>
              <span
                className={
                  row.profitLossPercent >= 0 ? 'positive' : 'negative'
                }
              >
                {formatPercent(row.profitLossPercent)}
              </span>
            </div>
          ))}

          {holdings.length === 0 && (
            <div className="empty-row">
              Bạn chưa nắm giữ cổ phiếu nào. Hãy chuyển sang trang Giao dịch để đặt lệnh.
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

