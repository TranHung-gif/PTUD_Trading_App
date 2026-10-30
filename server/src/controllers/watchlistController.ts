import { Response, NextFunction } from 'express'
import Watchlist from '../models/Watchlist.js'
import Stock from '../models/Stock.js'
import type { AuthRequest, ApiResponse } from '../types/index.js'

// GET /api/watchlist
export async function getWatchlist(
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!.id

    let watchlist = await Watchlist.findOne({ user: userId })
    if (!watchlist) {
      watchlist = await Watchlist.create({
        user: userId,
        symbols: ['FPT', 'VNM', 'HPG', 'VIC'],
      })
    }

    // Lấy thông tin chi tiết các stock trong watchlist
    const stocks = await Stock.find({ symbol: { $in: watchlist.symbols } })

    // Sắp xếp theo thứ tự trong watchlist
    const sortedStocks = watchlist.symbols
      .map((sym) => stocks.find((s) => s.symbol === sym))
      .filter(Boolean)

    res.json({
      success: true,
      data: {
        symbols: watchlist.symbols,
        stocks: sortedStocks,
      },
    })
  } catch (error) {
    next(error)
  }
}

// POST /api/watchlist/toggle - Thêm hoặc xoá 1 symbol khỏi watchlist
export async function toggleWatchlist(
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!.id
    const { symbol } = req.body

    if (!symbol || typeof symbol !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Mã cổ phiếu là bắt buộc.',
      })
      return
    }

    const upperSymbol = symbol.toUpperCase().trim()

    let watchlist = await Watchlist.findOne({ user: userId })
    if (!watchlist) {
      watchlist = await Watchlist.create({
        user: userId,
        symbols: ['FPT', 'VNM', 'HPG', 'VIC'],
      })
    }

    const index = watchlist.symbols.indexOf(upperSymbol)
    let isAdded = false

    if (index >= 0) {
      watchlist.symbols.splice(index, 1)
      isAdded = false
    } else {
      watchlist.symbols.push(upperSymbol)
      isAdded = true
    }

    await watchlist.save()

    res.json({
      success: true,
      message: isAdded
        ? `Đã thêm ${upperSymbol} vào danh sách theo dõi`
        : `Đã xóa ${upperSymbol} khỏi danh sách theo dõi`,
      data: {
        symbol: upperSymbol,
        isFavorite: isAdded,
        symbols: watchlist.symbols,
      },
    })
  } catch (error) {
    next(error)
  }
}

