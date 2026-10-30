import mongoose, { Schema, Document } from 'mongoose'
import type { IPortfolio, IHolding } from '../types/index.js'

export interface IPortfolioDocument extends Omit<IPortfolio, '_id' | 'user'>, Document {
  user: mongoose.Types.ObjectId
}

const holdingSchema = new Schema<IHolding>(
  {
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    avgPrice: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
)

const portfolioSchema = new Schema<IPortfolioDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    cashBalance: {
      type: Number,
      default: 125680000, // 125.68 triệu VND mặc định
      min: 0,
    },
    holdings: {
      type: [holdingSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
)

const Portfolio = mongoose.model<IPortfolioDocument>('Portfolio', portfolioSchema)

export default Portfolio

