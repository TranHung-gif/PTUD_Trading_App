import mongoose from 'mongoose'
import { connectDB } from './config/db.js'
import User from './models/User.js'
import Stock from './models/Stock.js'
import Portfolio from './models/Portfolio.js'
import Watchlist from './models/Watchlist.js'
import Order from './models/Order.js'

const candlesData = [
  [22, 36, 18, 30], [31, 45, 27, 42], [42, 48, 32, 35], [35, 41, 25, 29],
  [29, 39, 26, 37], [37, 51, 34, 47], [47, 55, 40, 43], [43, 49, 33, 36],
  [36, 45, 30, 41], [41, 53, 38, 50], [50, 61, 45, 57], [57, 65, 51, 54],
  [54, 63, 47, 60], [60, 72, 57, 69], [69, 75, 62, 65], [65, 78, 61, 73],
  [73, 81, 68, 77], [77, 84, 70, 72], [72, 82, 69, 80], [80, 90, 75, 87],
  [87, 94, 80, 83], [83, 91, 76, 79], [79, 89, 74, 86], [86, 96, 82, 93],
]

const seedStocks = [
  {
    symbol: 'FPT',
    name: 'FPT Corporation',
    exchange: 'HOSE',
    price: 134500,
    change: 2.36,
    open: 131400,
    high: 135200,
    low: 130800,
    close: 134500,
    volume: 3840000,
    valueTraded: 512400000000,
    high52w: 142800,
    low52w: 82600,
    color: '#28d79f',
    sector: 'Công nghệ',
    candles: candlesData,
  },
  {
    symbol: 'VNM',
    name: 'Vinamilk',
    exchange: 'HOSE',
    price: 68500,
    change: -0.72,
    open: 69000,
    high: 69400,
    low: 68100,
    close: 68500,
    volume: 1950000,
    valueTraded: 133575000000,
    high52w: 75500,
    low52w: 63200,
    color: '#ff6b72',
    sector: 'Tiêu dùng',
    candles: candlesData.map(([o, h, l, c]) => [c, h, l, o]),
  },
  {
    symbol: 'HPG',
    name: 'Hòa Phát Group',
    exchange: 'HOSE',
    price: 26750,
    change: 1.52,
    open: 26350,
    high: 27100,
    low: 26200,
    close: 26750,
    volume: 18240000,
    valueTraded: 487920000000,
    high52w: 31200,
    low52w: 24100,
    color: '#28d79f',
    sector: 'Sản xuất',
    candles: candlesData,
  },
  {
    symbol: 'VIC',
    name: 'Vingroup',
    exchange: 'HOSE',
    price: 41800,
    change: -1.18,
    open: 42300,
    high: 42500,
    low: 41500,
    close: 41800,
    volume: 2450000,
    valueTraded: 102410000000,
    high52w: 48900,
    low52w: 39500,
    color: '#ff6b72',
    sector: 'Bất động sản',
    candles: candlesData.map(([o, h, l, c]) => [c, h, l, o]),
  },
  {
    symbol: 'MWG',
    name: 'Mobile World',
    exchange: 'HOSE',
    price: 62400,
    change: 3.14,
    open: 60500,
    high: 62800,
    low: 60200,
    close: 62400,
    volume: 5120000,
    valueTraded: 319488000000,
    high52w: 68500,
    low52w: 43200,
    color: '#28d79f',
    sector: 'Bán lẻ',
    candles: candlesData,
  },
  {
    symbol: 'TCB',
    name: 'Techcombank',
    exchange: 'HOSE',
    price: 23850,
    change: 0.85,
    open: 23650,
    high: 24100,
    low: 23500,
    close: 23850,
    volume: 12400000,
    valueTraded: 295740000000,
    high52w: 26500,
    low52w: 18900,
    color: '#28d79f',
    sector: 'Tài chính',
    candles: candlesData,
  },
]

async function seed() {
  try {
    await connectDB()
    console.log('🌱 Seeding database...')

    // Clear existing collections
    await User.deleteMany({})
    await Stock.deleteMany({})
    await Portfolio.deleteMany({})
    await Watchlist.deleteMany({})
    await Order.deleteMany({})
    console.log('   Cleared existing data collections')

    // Create Stocks
    await Stock.insertMany(seedStocks)
    console.log(`   ✅ Seeded ${seedStocks.length} stocks: ${seedStocks.map((s) => s.symbol).join(', ')}`)

    // Create User: Nguyễn Long
    const longUser = await User.create({
      name: 'Nguyễn Long',
      email: 'long@finora.vn',
      password: 'finora2024',
      phone: '0912 345 678',
      settings: {
        darkMode: true,
        twoFactor: true,
        priceAlerts: true,
        orderAlerts: true,
      },
    })
    console.log(`   ✅ Created user: ${longUser.name} (${longUser.email})`)

    // Create User: Trần Minh
    const minhUser = await User.create({
      name: 'Trần Minh',
      email: 'minh@finora.vn',
      password: 'finora2024',
      phone: '0987 654 321',
      settings: {
        darkMode: false,
        twoFactor: false,
        priceAlerts: true,
        orderAlerts: true,
      },
    })
    console.log(`   ✅ Created user: ${minhUser.name} (${minhUser.email})`)

    // Create Portfolio for Nguyễn Long
    await Portfolio.create({
      user: longUser._id,
      cashBalance: 125680000,
      holdings: [
        { symbol: 'FPT', quantity: 1200, avgPrice: 108400 },
        { symbol: 'HPG', quantity: 3000, avgPrice: 22680 },
        { symbol: 'MWG', quantity: 1100, avgPrice: 54200 },
        { symbol: 'VNM', quantity: 700, avgPrice: 72900 },
      ],
    })
    console.log('   ✅ Created initial portfolio for Nguyễn Long')

    // Create Watchlist for Nguyễn Long
    await Watchlist.create({
      user: longUser._id,
      symbols: ['FPT', 'VNM', 'HPG', 'VIC'],
    })
    console.log('   ✅ Created initial watchlist for Nguyễn Long')

    // Create initial Orders for Nguyễn Long
    await Order.create([
      {
        orderCode: 'FN24061803',
        user: longUser._id,
        symbol: 'HPG',
        side: 'Mua',
        orderType: 'LO',
        quantity: 500,
        price: 26750,
        totalAmount: 500 * 26750 * 1.0015,
        fee: 500 * 26750 * 0.0015,
        status: 'Đã khớp',
        matchedAt: new Date(Date.now() - 3600000),
      },
      {
        orderCode: 'FN24061802',
        user: longUser._id,
        symbol: 'VNM',
        side: 'Bán',
        orderType: 'LO',
        quantity: 200,
        price: 68500,
        totalAmount: 200 * 68500 * 0.9985,
        fee: 200 * 68500 * 0.0015,
        status: 'Chờ khớp',
      },
      {
        orderCode: 'FN24061801',
        user: longUser._id,
        symbol: 'FPT',
        side: 'Mua',
        orderType: 'LO',
        quantity: 100,
        price: 132400,
        totalAmount: 100 * 132400 * 1.0015,
        fee: 100 * 132400 * 0.0015,
        status: 'Đã khớp',
        matchedAt: new Date(Date.now() - 7200000),
      },
    ])
    console.log('   ✅ Seeded sample trading orders')

    console.log('\n✨ Database seed successfully completed!')
    console.log('   Login: long@finora.vn / finora2024')
  } catch (error) {
    console.error('❌ Seed failed:', error)
  } finally {
    await mongoose.connection.close()
    process.exit(0)
  }
}

seed()
