import { Response, NextFunction } from 'express'
import { verifyAccessToken } from '../utils/jwt.js'
import type { AuthRequest } from '../types/index.js'

export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Không tìm thấy token xác thực. Vui lòng đăng nhập.',
    })
    return
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = verifyAccessToken(token)
    req.user = { id: decoded.id, email: decoded.email }
    next()
  } catch {
    res.status(401).json({
      success: false,
      message: 'Token không hợp lệ hoặc đã hết hạn.',
    })
  }
}