import { Router } from 'express'
import { getWatchlist, toggleWatchlist } from '../controllers/watchlistController.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.use(authenticate)

router.get('/', getWatchlist)
router.post('/toggle', toggleWatchlist)

export default router

