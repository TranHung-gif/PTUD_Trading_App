import { Router } from 'express'
import { body } from 'express-validator'
import {
  register,
  login,
  googleLogin,
  getMe,
  updateProfile,
  changePassword,
  refreshToken,
} from '../controllers/authController.js'
import { authenticate } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'

const router = Router()

// Public routes
router.post(
  '/register',
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Họ và tên là bắt buộc')
      .isLength({ min: 2, max: 50 })
      .withMessage('Tên phải từ 2 đến 50 ký tự'),
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email là bắt buộc')
      .isEmail()
      .withMessage('Email không hợp lệ')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Mật khẩu là bắt buộc')
      .isLength({ min: 8 })
      .withMessage('Mật khẩu phải có ít nhất 8 ký tự'),
    body('phone').optional().trim(),
    validate,
  ],
  register,
)

router.post(
  '/login',
  [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email là bắt buộc')
      .isEmail()
      .withMessage('Email không hợp lệ')
      .normalizeEmail(),
    body('password').notEmpty().withMessage('Mật khẩu là bắt buộc'),
    validate,
  ],
  login,
)

router.post('/google', googleLogin)

router.post(
  '/refresh',
  [
    body('refreshToken').notEmpty().withMessage('Refresh token là bắt buộc'),
    validate,
  ],
  refreshToken,
)

// Protected routes (require JWT)
router.get('/me', authenticate, getMe)

router.put(
  '/profile',
  authenticate,
  [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Tên phải từ 2 đến 50 ký tự'),
    body('phone').optional().trim(),
    body('settings').optional().isObject().withMessage('Settings phải là object'),
    validate,
  ],
  updateProfile,
)

router.put(
  '/change-password',
  authenticate,
  [
    body('currentPassword')
      .notEmpty()
      .withMessage('Mật khẩu hiện tại là bắt buộc'),
    body('newPassword')
      .notEmpty()
      .withMessage('Mật khẩu mới là bắt buộc')
      .isLength({ min: 8 })
      .withMessage('Mật khẩu mới phải có ít nhất 8 ký tự'),
    validate,
  ],
  changePassword,
)

export default router

