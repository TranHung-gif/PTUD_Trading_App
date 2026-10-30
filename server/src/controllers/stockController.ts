import { Request, Response, NextFunction } from 'express'
import Stock from '../models/Stock.js'
import { AppError } from '../middleware/errorHandler.js'
import type { ApiResponse } from '../types/index.js'

// GET /api/stocks
export async function getStocks(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction,
): Promise<void> {
  try {
    const { search, sector } = req.query

    const filter: Record<string, unknown> = {}
    if (search && typeof search === 'string') {
      filter.$or = [
        { symbol: { $regex: search.trim(), $options: 'i' } },
        { name: { $regex: search.trim(), $options: 'i' } },
      ]
    }
    if (sector && typeof sector === 'string') {
      filter.sector = sector
    }

    const stocks = await Stock.find(filter).sort({ symbol: 1 })
    res.json({
      success: true,
      data: stocks,
    })
  } catch (error) {
    next(error)
  }
}

// GET /api/stocks/:symbol
export async function getStockBySymbol(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction,
): Promise<void> {
  try {
    const symbol = Array.isArray(req.params.symbol) ? req.params.symbol[0] : req.params.symbol
    const stock = await Stock.findOne({ symbol: symbol.toUpperCase() })

    if (!stock) {
      throw new AppError(`Không tìm thấy mã cổ phiếu ${symbol}`, 404)
    }

    res.json({
      success: true,
      data: stock,
    })
  } catch (error) {
    next(error)
  }
}

// GET /api/stocks/market/indices
export async function getMarketIndices(
  _req: Request,
  res: Response<ApiResponse>,
  _next: NextFunction,
): Promise<void> {
  const indices = [
    { name: 'VN-INDEX', value: '1.347,14', change: '+0,62%', isPositive: true },
    { name: 'VN30', value: '1.439,63', change: '+0,48%', isPositive: true },
    { name: 'HNX-INDEX', value: '228,91', change: '-0,15%', isPositive: false },
  ]

  res.json({
    success: true,
    data: indices,
  })
}
