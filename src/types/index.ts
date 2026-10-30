export interface User {
  _id: string
  name: string
  email: string
  phone?: string
  investorCode: string
  avatar?: string
  settings: {
    darkMode: boolean
    twoFactor: boolean
    priceAlerts: boolean
    orderAlerts: boolean
    language?: 'vi' | 'en'
  }
}

export interface Stock {
  _id: string
  symbol: string
  name: string
  exchange: string
  price: number
  change: number
  high: number
  low: number
  open: number
  close: number
  volume: number
  valueTraded: number
  high52w: number
  low52w: number
  color: string
  sector: string
  candles: number[][]
}

export interface Order {
  _id: string
  orderCode: string
  symbol: string
  side: 'Mua' | 'Bán'
  orderType: 'LO' | 'ATO' | 'ATC'
  quantity: number
  price: number
  totalAmount: number
  fee: number
  status: 'Chờ khớp' | 'Đã khớp' | 'Đã hủy'
  matchedAt?: string
  createdAt: string
}

export interface HoldingItem {
  symbol: string
  name: string
  quantity: number
  avgPrice: number
  currentPrice: number
  marketValue: number
  profitLoss: number
  profitLossPercent: number
  change: number
}

export interface PortfolioData {
  netWorth: number
  cashBalance: number
  stockValue: number
  totalProfit: number
  totalProfitPercent: number
  todayProfit: number
  holdings: HoldingItem[]
}

export interface MarketIndex {
  name: string
  value: string
  change: string
  isPositive: boolean
}

export interface ApiResponse<T = unknown> {
  success: boolean
  message?: string
  data?: T
}

