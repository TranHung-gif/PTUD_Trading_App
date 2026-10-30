import { Response, NextFunction } from 'express'
import Portfolio from '../models/Portfolio.js'
import Stock from '../models/Stock.js'
import type { AuthRequest, ApiResponse } from '../types/index.js'

// GET /api/portfolio - Lấy tổng quan danh mục tài sản của user
export async function getPortfolio(
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!.id

    let portfolio = await Portfolio.findOne({ user: userId })
    if (!portfolio) {
      // Khởi tạo danh mục mặc định
      portfolio = await Portfolio.create({
        user: userId,
        cashBalance: 125680000,
        holdings: [
          { symbol: 'FPT', quantity: 1200, avgPrice: 108400 },
          { symbol: 'HPG', quantity: 3000, avgPrice: 22680 },
          { symbol: 'MWG', quantity: 1100, avgPrice: 54200 },
          { symbol: 'VNM', quantity: 700, avgPrice: 72900 },
        ],
      })
    }

    // Lấy thông tin giá hiện tại của tất cả cổ phiếu
    const symbols = portfolio.holdings.map((h) => h.symbol)
    const stocks = await Stock.find({ symbol: { $in: symbols } })
    const stockMap = new Map(stocks.map((s) => [s.symbol, s]))

    let stockValue = 0
    let totalCost = 0
    let todayProfit = 0

    const holdingsWithMarket = portfolio.holdings.map((h) => {
      const stock = stockMap.get(h.symbol)
      const currentPrice = stock ? stock.price : h.avgPrice
      const marketValue = h.quantity * currentPrice
      const costValue = h.quantity * h.avgPrice
      const profitLoss = marketValue - costValue
      const profitLossPercent = costValue > 0 ? (profitLoss / costValue) * 100 : 0

      // Ước tính biến động hôm nay dựa trên % change của mã
      const changeRate = (stock ? stock.change : 0) / 100
      const todayChangeValue = marketValue * (changeRate / (1 + changeRate))

      stockValue += marketValue
      totalCost += costValue
      todayProfit += todayChangeValue

      return {
        symbol: h.symbol,
        name: stock ? stock.name : h.symbol,
        quantity: h.quantity,
        avgPrice: h.avgPrice,
        currentPrice,
        marketValue,
        profitLoss,
        profitLossPercent: Number(profitLossPercent.toFixed(2)),
        change: stock ? stock.change : 0,
      }
    })

    const netWorth = portfolio.cashBalance + stockValue
    const totalProfit = stockValue - totalCost
    const totalProfitPercent = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0

    res.json({
      success: true,
      data: {
        netWorth,
        cashBalance: portfolio.cashBalance,
        stockValue,
        totalProfit,
        totalProfitPercent: Number(totalProfitPercent.toFixed(2)),
        todayProfit: Math.round(todayProfit),
        holdings: holdingsWithMarket,
      },
    })
  } catch (error) {
    next(error)
  }
}

