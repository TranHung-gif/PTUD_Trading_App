import { Request, Response, NextFunction } from 'express'
import { OAuth2Client } from 'google-auth-library'
import User from '../models/User.js'
import Portfolio from '../models/Portfolio.js'
import Watchlist from '../models/Watchlist.js'
import { generateTokens, verifyRefreshToken } from '../utils/jwt.js'
import { AppError } from '../middleware/errorHandler.js'
import { env } from '../config/env.js'
import { sendWelcomeEmail, sendSecurityAlertEmail } from '../services/emailService.js'
import type { AuthRequest, ApiResponse } from '../types/index.js'

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID)

// POST /api/auth/register
export async function register(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction,
): Promise<void> {
  try {
    const { name, email, password, phone } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      throw new AppError('Email này đã được đăng ký.', 409)
    }

    // Create new user
    const user = await User.create({ name, email, password, phone })

    // Khởi tạo Portfolio & Watchlist
    await Portfolio.create({
      user: user._id,
      cashBalance: 125680000,
      holdings: [],
    })

    await Watchlist.create({
      user: user._id,
      symbols: ['FPT', 'VNM', 'HPG', 'VIC'],
    })

    // Gửi email chào mừng kích hoạt tài khoản
    sendWelcomeEmail(user.email, user.name, user.investorCode).catch((err) =>
      console.error('Lỗi gửi mail chào mừng:', err),
    )

    // Generate tokens
    const tokens = generateTokens({ id: String(user._id), email: user.email })

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công! Đã gửi thông báo kích hoạt về email.',
      data: {
        user: user.toJSON(),
        ...tokens,
      },
    })
  } catch (error) {
    next(error)
  }
}

// POST /api/auth/login
export async function login(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction,
): Promise<void> {
  try {
    const { email, password } = req.body

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      throw new AppError('Email hoặc mật khẩu không chính xác.', 401)
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      throw new AppError('Email hoặc mật khẩu không chính xác.', 401)
    }

    // Generate tokens
    const tokens = generateTokens({ id: String(user._id), email: user.email })

    res.json({
      success: true,
      message: `Xin chào, ${user.name}!`,
      data: {
        user: user.toJSON(),
        ...tokens,
      },
    })
  } catch (error) {
    next(error)
  }
}

// POST /api/auth/google - Đăng nhập / Đăng ký bằng Google
export async function googleLogin(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction,
): Promise<void> {
  try {
    const { idToken, email: bodyEmail, name: bodyName, picture: bodyPicture, googleId: bodyGoogleId } = req.body

    let email = bodyEmail
    let name = bodyName
    let picture = bodyPicture
    let googleId = bodyGoogleId

    // 1. Verify idToken nếu có cấu hình Google Client ID và client gửi token
    if (idToken && env.GOOGLE_CLIENT_ID) {
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken,
          audience: env.GOOGLE_CLIENT_ID,
        })
        const payload = ticket.getPayload()
        if (payload) {
          email = payload.email
          name = payload.name
          picture = payload.picture
          googleId = payload.sub
        }
      } catch {
        throw new AppError('Xác thực Google ID Token không hợp lệ.', 401)
      }
    }

    if (!email) {
      throw new AppError('Không nhận được email từ tài khoản Google.', 400)
    }

    // 2. Tìm hoặc tạo user
    let user = await User.findOne({
      $or: [{ googleId: googleId || 'non-existent' }, { email: email.toLowerCase() }],
    })

    let isNewUser = false

    if (!user) {
      isNewUser = true
      user = await User.create({
        name: name || email.split('@')[0],
        email: email.toLowerCase(),
        googleId,
        avatar: picture || '',
      })

      // Khởi tạo Portfolio & Watchlist cho user mới
      await Portfolio.create({
        user: user._id,
        cashBalance: 125680000,
        holdings: [],
      })

      await Watchlist.create({
        user: user._id,
        symbols: ['FPT', 'VNM', 'HPG', 'VIC'],
      })

      // Gửi email chào mừng thành viên mới
      sendWelcomeEmail(user.email, user.name, user.investorCode).catch((err) =>
        console.error('Lỗi gửi mail chào mừng:', err),
      )
    } else {
      // Cập nhật googleId và avatar nếu chưa có
      let shouldUpdate = false
      if (!user.googleId && googleId) {
        user.googleId = googleId
        shouldUpdate = true
      }
      if (!user.avatar && picture) {
        user.avatar = picture
        shouldUpdate = true
      }
      if (shouldUpdate) {
        await user.save()
      }
    }

    // Generate tokens
    const tokens = generateTokens({ id: String(user._id), email: user.email })

    res.json({
      success: true,
      message: isNewUser
        ? `Chào mừng ${user.name} gia nhập Finora qua Google!`
        : `Xin chào trở lại, ${user.name}!`,
      data: {
        user: user.toJSON(),
        ...tokens,
      },
    })
  } catch (error) {
    next(error)
  }
}

// GET /api/auth/me
export async function getMe(
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction,
): Promise<void> {
  try {
    const user = await User.findById(req.user!.id)
    if (!user) {
      throw new AppError('Không tìm thấy người dùng.', 404)
    }

    res.json({
      success: true,
      data: { user: user.toJSON() },
    })
  } catch (error) {
    next(error)
  }
}

// PUT /api/auth/profile
export async function updateProfile(
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction,
): Promise<void> {
  try {
    const { name, phone, settings } = req.body

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (phone !== undefined) updateData.phone = phone
    if (settings !== undefined) updateData.settings = settings

    const user = await User.findByIdAndUpdate(req.user!.id, updateData, {
      new: true,
      runValidators: true,
    })

    if (!user) {
      throw new AppError('Không tìm thấy người dùng.', 404)
    }

    res.json({
      success: true,
      message: 'Cập nhật hồ sơ thành công!',
      data: { user: user.toJSON() },
    })
  } catch (error) {
    next(error)
  }
}

// PUT /api/auth/change-password
export async function changePassword(
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction,
): Promise<void> {
  try {
    const { currentPassword, newPassword } = req.body

    const user = await User.findById(req.user!.id).select('+password')
    if (!user) {
      throw new AppError('Không tìm thấy người dùng.', 404)
    }

    if (!user.password) {
      // User đăng nhập bằng Google lần đầu đổi mật khẩu
      user.password = newPassword
    } else {
      const isValid = await user.comparePassword(currentPassword)
      if (!isValid) {
        throw new AppError('Mật khẩu hiện tại không chính xác.', 401)
      }
      user.password = newPassword
    }

    await user.save()

    // Gửi email cảnh báo bảo mật
    sendSecurityAlertEmail(
      user.email,
      user.name,
      'Thay đổi mật khẩu đăng nhập thành công',
    ).catch((err) => console.error('Lỗi gửi mail bảo mật:', err))

    // Generate new tokens after password change
    const tokens = generateTokens({ id: String(user._id), email: user.email })

    res.json({
      success: true,
      message: 'Đổi mật khẩu thành công! Thông báo đã được gửi về email của bạn.',
      data: tokens,
    })
  } catch (error) {
    next(error)
  }
}

// POST /api/auth/refresh
export async function refreshToken(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction,
): Promise<void> {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      throw new AppError('Refresh token là bắt buộc.', 400)
    }

    const decoded = verifyRefreshToken(refreshToken)

    // Verify user still exists
    const user = await User.findById(decoded.id)
    if (!user) {
      throw new AppError('Người dùng không tồn tại.', 404)
    }

    // Generate new tokens
    const tokens = generateTokens({ id: String(user._id), email: user.email })

    res.json({
      success: true,
      data: tokens,
    })
  } catch (error) {
    next(error)
  }
}
