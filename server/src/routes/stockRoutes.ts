import { Router, Request, Response } from 'express'
import {
  getStocks,
  getStockBySymbol,
  getMarketIndices,
} from '../controllers/stockController.js'
import {
  subscribeClient,
  unsubscribeClient,
} from '../services/realtimePriceService.js'

const router = Router()

// SSE Stream endpoint for Real-time ticks
router.get('/live/stream', (req: Request, res: Response) => {
  const clientId = subscribeClient(res)

  req.on('close', () => {
    unsubscribeClient(clientId)
  })
})

router.get('/', getStocks)
router.get('/market/indices', getMarketIndices)
router.get('/:symbol', getStockBySymbol)

export default router
