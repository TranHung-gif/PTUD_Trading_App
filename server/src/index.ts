import express from 'express'
import cors from 'cors'
import { connectDB } from './config/db.js'
import { env } from './config/env.js'
import { errorHandler } from './middleware/errorHandler.js'
import { startRealtimeEngine } from './services/realtimePriceService.js'
import authRoutes from './routes/authRoutes.js'
import stockRoutes from './routes/stockRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import portfolioRoutes from './routes/portfolioRoutes.js'
import watchlistRoutes from './routes/watchlistRoutes.js'

const app = express()

// Middleware
app.use(cors({ origin: env.CLIENT_URL, credentials: true }))
app.use(express.json())

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/stocks', stockRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/portfolio', portfolioRoutes)
app.use('/api/watchlist', watchlistRoutes)

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Finora API is running 🚀',
    timestamp: new Date().toISOString(),
  })
})

// Error handler (must be last)
app.use(errorHandler)

// Start server
async function start() {
  await connectDB()
  
  // Khởi động Real-time Price Streaming Engine
  startRealtimeEngine()

  app.listen(env.PORT, () => {
    console.log(`
╔══════════════════════════════════════╗
║     🚀 Finora API Server            ║
║     Port: ${String(env.PORT).padEnd(25)}║
║     MongoDB: Connected               ║
║     Real-time Engine: Running (3s)   ║
╚══════════════════════════════════════╝
    `)
  })
}

start()
