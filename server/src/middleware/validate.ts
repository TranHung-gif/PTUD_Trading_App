import { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'
import type { ApiResponse } from '../types/index.js'

export function validate(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction,
): void {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const messages = errors.array().map((err) => err.msg)
    res.status(400).json({
      success: false,
      message: messages[0], // Return first validation error
      data: { errors: errors.array() },
    })
    return
  }
  next()
}

