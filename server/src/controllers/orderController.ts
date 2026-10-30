import { Response, NextFunction } from 'express'
import Order from '../models/Order.js'
import Portfolio from '../models/Portfolio.js'
import Stock from '../models/Stock.js'
import User from '../models/User.js'
import { sendOrderConfirmationEmail } from '../services/emailService.js'
import { AppError } from '../middleware/errorHandler.js'
import type { AuthRequest, ApiResponse } from '../types/index.js'

const TRADING_FEE_RATE = 0.0015 // 0.15% phí giao dịch

// POST /api/orders - Đặt lệnh mua hoặc bán
export async function placeOrder(
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!.id
    const { symbol, side, orderType = 'LO', quantity, price } = req.body

    const qty = Number(quantity)
    const orderPrice = Number(price)

    if (!qty || qty <= 0) {
      throw new AppError('Khối lượng đặt lệnh không hợp lệ.', 400)
    }

    if (!orderPrice || orderPrice <= 0) {
      throw new AppError('Giá đặt lệnh không hợp lệ.', 400)
    }

    // Verify stock exists
    const stock = await Stock.findOne({ symbol: symbol.toUpperCase() })
    if (!stock) {
      throw new AppError(`Mã cổ phiếu ${symbol} không tồn tại.`, 404)
    }

    // Get or create user portfolio
    let portfolio = await Portfolio.findOne({ user: userId })
    if (!portfolio) {
      portfolio = await Portfolio.create({ user: userId, cashBalance: 125680000, holdings: [] })
    }

    const orderValue = qty * orderPrice
    const fee = orderValue * TRADING_FEE_RATE
    const totalPayment = orderValue + fee

    // Logic kiểm tra số dư và cập nhật danh mục
    if (side === 'Mua') {
      if (portfolio.cashBalance < totalPayment) {
        throw new AppError(
          `Sức mua không đủ. Cần ${new Intl.NumberFormat('vi-VN').format(totalPayment)} ₫ nhưng số dư khả dụng chỉ còn ${new Intl.NumberFormat('vi-VN').format(portfolio.cashBalance)} ₫.`,
          400,
        )
      }

      // Khấu trừ tiền mặt
      portfolio.cashBalance -= totalPayment

      // Cập nhật holdings
      const holdingIndex = portfolio.holdings.findIndex(
        (h) => h.symbol.toUpperCase() === symbol.toUpperCase(),
      )

      if (holdingIndex >= 0) {
        const currentHolding = portfolio.holdings[holdingIndex]
        const newTotalQty = currentHolding.quantity + qty
        const newAvgPrice =
          (currentHolding.quantity * currentHolding.avgPrice + qty * orderPrice) / newTotalQty

        portfolio.holdings[holdingIndex].quantity = newTotalQty
        portfolio.holdings[holdingIndex].avgPrice = Math.round(newAvgPrice)
      } else {
        portfolio.holdings.push({
          symbol: symbol.toUpperCase(),
          quantity: qty,
          avgPrice: orderPrice,
        })
      }
    } else if (side === 'Bán') {
      const holdingIndex = portfolio.holdings.findIndex(
        (h) => h.symbol.toUpperCase() === symbol.toUpperCase(),
      )

      if (holdingIndex < 0 || portfolio.holdings[holdingIndex].quantity < qty) {
        const available = holdingIndex >= 0 ? portfolio.holdings[holdingIndex].quantity : 0
        throw new AppError(
          `Số dư cổ phiếu không đủ để bán. Bạn đang có ${available} cổ phiếu ${symbol}.`,
          400,
        )
      }

      // Cộng tiền sau khi trừ phí
      portfolio.cashBalance += (orderValue - fee)

      // Cập nhật hoặc xoá holding
      if (portfolio.holdings[holdingIndex].quantity === qty) {
        portfolio.holdings.splice(holdingIndex, 1)
      } else {
        portfolio.holdings[holdingIndex].quantity -= qty
      }
    } else {
      throw new AppError('Loại giao dịch phải là Mua hoặc Bán.', 400)
    }

    await portfolio.save()

    // Tạo bản ghi Order
    const orderCode = `FN${Date.now().toString().slice(-8)}`
    const order = await Order.create({
      orderCode,
      user: userId,
      symbol: symbol.toUpperCase(),
      side,
      orderType,
      quantity: qty,
      price: orderPrice,
      totalAmount: totalPayment,
      fee,
      status: 'Đã khớp', // Khớp tức thì cho trading demo
      matchedAt: new Date(),
    })

    // Gửi email xác nhận khớp lệnh về hòm thư người dùng
    User.findById(userId)
      .then((user) => {
        if (user?.email) {
          sendOrderConfirmationEmail(user.email, user.name, {
            orderCode: order.orderCode,
            symbol: order.symbol,
            side: order.side,
            quantity: order.quantity,
            price: order.price,
            totalAmount: order.totalAmount,
            fee: order.fee,
            status: order.status,
          }).catch((err) => console.error('Lỗi gửi email xác nhận lệnh:', err))
        }
      })
      .catch((err) => console.error('Lỗi tìm user gửi mail:', err))

    res.status(201).json({
      success: true,
      message: `Đã khớp lệnh ${side.toLowerCase()} ${qty} ${symbol.toUpperCase()} thành công!`,
      data: {
        order,
        cashBalance: portfolio.cashBalance,
      },
    })
  } catch (error) {
    next(error)
  }
}

// GET /api/orders - Lấy danh sách lệnh của user
export async function getOrders(
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!.id
    const { status, symbol } = req.query

    const filter: Record<string, unknown> = { user: userId }
    if (status && status !== 'Tất cả') {
      filter.status = status
    }
    if (symbol && typeof symbol === 'string') {
      filter.symbol = symbol.toUpperCase()
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 })

    res.json({
      success: true,
      data: orders,
    })
  } catch (error) {
    next(error)
  }
}

// PUT /api/orders/:id/cancel - Hủy lệnh chờ khớp
export async function cancelOrder(
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!.id
    const { id } = req.params

    const order = await Order.findOne({ _id: id, user: userId })
    if (!order) {
      throw new AppError('Không tìm thấy lệnh yêu cầu.', 404)
    }

    if (order.status !== 'Chờ khớp') {
      throw new AppError(`Không thể hủy lệnh ở trạng thái "${order.status}".`, 400)
    }

    order.status = 'Đã hủy'
    await order.save()

    // Hoàn trả sức mua nếu là lệnh Mua
    if (order.side === 'Mua') {
      await Portfolio.findOneAndUpdate(
        { user: userId },
        { $inc: { cashBalance: order.totalAmount } },
      )
    }

    res.json({
      success: true,
      message: `Đã hủy lệnh ${order.orderCode} thành công.`,
      data: order,
    })
  } catch (error) {
    next(error)
  }
}

