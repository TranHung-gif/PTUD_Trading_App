import React, { useState } from 'react'
import { ArrowUpRight, ChevronDown, PieChart } from 'lucide-react'
import { formatVnd, formatPercent } from '../utils/format.js'
import type { PortfolioData } from '../types/index.js'

interface OverviewProps {
  portfolio: PortfolioData | null
  pendingOrdersCount: number
  onNavigate: (page: string) => void
}

export function Overview({
  portfolio,
  pendingOrdersCount,
  onNavigate,
}: OverviewProps) {
  const [performancePeriod, setPerformancePeriod] = useState('30 ngày')

  const netWorth = portfolio?.netWorth ?? 486240000
  const cashBalance = portfolio?.cashBalance ?? 125680000
  const stockValue = portfolio?.stockValue ?? 360560000
  const totalProfit = portfolio?.totalProfit ?? 42780000
  const totalProfitPercent = portfolio?.totalProfitPercent ?? 13.46
  const todayProfit = portfolio?.todayProfit ?? 8640000

  return (
    <section className="overview-page page-content">
      <div className="welcome-row">
        <div>
          <small>TÀI SẢN RÒNG</small>
          <strong>{formatVnd(netWorth)} ₫</strong>
          <span className="positive">
            <ArrowUpRight size={14} /> +12,8% trong tháng này
          </span>
        </div>
        <button onClick={() => onNavigate('Giao dịch')}>
          Giao dịch ngay <ArrowUpRight size={16} />
        </button>
      </div>

      <div className="metric-grid">
        <article>
          <span>Giá trị danh mục</span>
          <b>{formatVnd(stockValue)} ₫</b>
          <small className="positive">
            {todayProfit >= 0 ? '+' : ''}
            {formatVnd(todayProfit)} ₫ hôm nay
          </small>
        </article>
        <article>
          <span>Sức mua khả dụng</span>
          <b>{formatVnd(cashBalance)} ₫</b>
          <small>Sẵn sàng giao dịch</small>
        </article>
        <article>
          <span>Lợi nhuận tích lũy</span>
          <b className={totalProfit >= 0 ? 'positive' : 'negative'}>
            {totalProfit >= 0 ? '+' : ''}
            {formatVnd(totalProfit)} ₫
          </b>
          <small>{formatPercent(totalProfitPercent)} từ đầu tư</small>
        </article>
        <article>
          <span>Lệnh đang chờ</span>
          <b>{pendingOrdersCount}</b>
          <small onClick={() => onNavigate('Lệnh của tôi')}>
            Xem chi tiết →
          </small>
        </article>
      </div>

      <div className="overview-grid">
        <div className="panel performance-card">
          <div className="section-title">
            <div>
              <b>Hiệu suất tài sản</b>
              <small>{performancePeriod} gần nhất</small>
            </div>
            <button
              onClick={() =>
                setPerformancePeriod((cur) =>
                  cur === '7 ngày' ? '30 ngày' : cur === '30 ngày' ? '3 tháng' : '7 ngày',
                )
              }
            >
              {performancePeriod} <ChevronDown size={14} />
            </button>
          </div>
          <div className="performance-chart">
            <div className="chart-y">
              <span>500tr</span>
              <span>450tr</span>
              <span>400tr</span>
              <span>350tr</span>
            </div>
            <svg viewBox="0 0 720 220" preserveAspectRatio="none">
              <defs>
                <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#2add9e" stopOpacity=".25" />
                  <stop offset="1" stopColor="#2add9e" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                className="area"
                d="M0 190 C50 180,70 165,110 172 S170 130,220 145 S290 105,340 118 S410 80,455 92 S520 58,565 68 S640 28,720 34 L720 220 L0 220Z"
              />
              <path
                className="line"
                d="M0 190 C50 180,70 165,110 172 S170 130,220 145 S290 105,340 118 S410 80,455 92 S520 58,565 68 S640 28,720 34"
              />
            </svg>
          </div>
        </div>

        <div className="panel allocation-card">
          <div className="section-title">
            <div>
              <b>Phân bổ danh mục</b>
              <small>Theo giá trị thị trường</small>
            </div>
            <PieChart size={18} />
          </div>
          <div className="donut">
            <div>
              <b>{(stockValue / 1000000).toFixed(1)}tr</b>
              <small>Tổng giá trị</small>
            </div>
          </div>
          <ul>
            <li>
              <i className="c1" />
              Công nghệ <b>42%</b>
            </li>
            <li>
              <i className="c2" />
              Sản xuất <b>26%</b>
            </li>
            <li>
              <i className="c3" />
              Tiêu dùng <b>19%</b>
            </li>
            <li>
              <i className="c4" />
              Khác <b>13%</b>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}

