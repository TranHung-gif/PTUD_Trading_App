import { Router } from 'express'
import { getPortfolio } from '../controllers/portfolioController.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.get('/', authenticate, getPortfolio)

export default router

