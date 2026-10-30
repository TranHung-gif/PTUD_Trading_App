import { Router } from 'express'
import { body } from 'express-validator'
import {
  placeOrder,
  getOrders,
  cancelOrder,
} from '../controllers/orderController.js'
import { authenticate } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'

const router = Router()

// Tất cả route orders đều yêu cầu đăng nhập
router.use(authenticate)

router.post(
  '/',
  [
    body('symbol').trim().notEmpty().withMessage('Mã cổ phiếu là bắt buộc'),
    body('side').isIn(['Mua', 'Bán']).withMessage('Loại lệnh phải là Mua hoặc Bán'),
    body('quantity').isInt({ min: 100 }).withMessage('Khối lượng tối thiểu là 100 cổ phiếu'),
    body('price').isFloat({ min: 1000 }).withMessage('Giá đặt không hợp lệ'),
    body('orderType').optional().isIn(['LO', 'ATO', 'ATC']).withMessage('Loại lệnh không hợp lệ'),
    validate,
  ],
  placeOrder,
)

router.get('/', getOrders)
router.put('/:id/cancel', cancelOrder)

export default router

