import mongoose, { Schema, Document } from 'mongoose'
import type { IStock } from '../types/index.js'

export interface IStockDocument extends Omit<IStock, '_id'>, Document {}

const stockSchema = new Schema<IStockDocument>(
  {
    symbol: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    exchange: {
      type: String,
      default: 'HOSE',
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    change: {
      type: Number,
      default: 0,
    },
    high: {
      type: Number,
      default: 0,
    },
    low: {
      type: Number,
      default: 0,
    },
    open: {
      type: Number,
      default: 0,
    },
    close: {
      type: Number,
      default: 0,
    },
    volume: {
      type: Number,
      default: 0,
    },
    valueTraded: {
      type: Number,
      default: 0,
    },
    high52w: {
      type: Number,
      default: 0,
    },
    low52w: {
      type: Number,
      default: 0,
    },
    color: {
      type: String,
      default: '#28d79f',
    },
    sector: {
      type: String,
      default: 'Khác',
    },
    candles: {
      type: [[Number]],
      default: [],
    },
  },
  {
    timestamps: true,
  },
)

const Stock = mongoose.model<IStockDocument>('Stock', stockSchema)

export default Stock

