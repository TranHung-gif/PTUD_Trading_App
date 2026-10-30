import { Request } from 'express'

export interface IUser {
  _id: string
  name: string
  email: string
  password: string
  phone: string
  investorCode: string
  avatar: string
  settings: {
    darkMode: boolean
    twoFactor: boolean
    priceAlerts: boolean
    orderAlerts: boolean
    language?: 'vi' | 'en'
  }
  createdAt: Date
  updatedAt: Date
}

export interface IStock {
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

export interface IOrder {
  _id: string
  orderCode: string
  user: string
  symbol: string
  side: 'Mua' | 'Bán'
  orderType: 'LO' | 'ATO' | 'ATC'
  quantity: number
  price: number
  totalAmount: number
  fee: number
  status: 'Chờ khớp' | 'Đã khớp' | 'Đã hủy'
  matchedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface IHolding {
  symbol: string
  quantity: number
  avgPrice: number
}

export interface IPortfolio {
  _id: string
  user: string
  cashBalance: number
  holdings: IHolding[]
  createdAt: Date
  updatedAt: Date
}

export interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
  }
}

export interface TokenPayload {
  id: string
  email: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  message?: string
  data?: T
}
