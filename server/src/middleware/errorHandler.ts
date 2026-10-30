import { Request, Response, NextFunction } from 'express'
import type { ApiResponse } from '../types/index.js'

// Custom error class with status code
export class AppError extends Error {
  statusCode: number
  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
    this.name = 'AppError'
  }
}

// Global error handler middleware
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response<ApiResponse>,
  _next: NextFunction,
): void {
  console.error('❌ Error:', err.message)

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values((err as any).errors).map(
      (e: any) => e.message,
    )
    res.status(400).json({
      success: false,
      message: messages.join('. '),
    })
    return
  }

  // Mongoose duplicate key error
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue)[0]
    res.status(409).json({
      success: false,
      message: `${field === 'email' ? 'Email' : field} đã được sử dụng.`,
    })
    return
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      message: 'Token không hợp lệ.',
    })
    return
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      message: 'Token đã hết hạn.',
    })
    return
  }

  // Custom AppError
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    })
    return
  }

  // Default server error
  res.status(500).json({
    success: false,
    message: 'Lỗi máy chủ. Vui lòng thử lại sau.',
  })
}

