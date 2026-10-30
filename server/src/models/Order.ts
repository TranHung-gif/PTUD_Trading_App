import mongoose, { Schema, Document } from 'mongoose'
import type { IOrder } from '../types/index.js'

export interface IOrderDocument extends Omit<IOrder, '_id' | 'user'>, Document {
  user: mongoose.Types.ObjectId
}

const orderSchema = new Schema<IOrderDocument>(
  {
    orderCode: {
      type: String,
      unique: true,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    side: {
      type: String,
      enum: ['Mua', 'Bán'],
      required: true,
    },
    orderType: {
      type: String,
      enum: ['LO', 'ATO', 'ATC'],
      default: 'LO',
    },
    quantity: {
      type: Number,
      required: true,
      min: [100, 'Khối lượng tối thiểu là 100 cổ phiếu'],
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    fee: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Chờ khớp', 'Đã khớp', 'Đã hủy'],
      default: 'Chờ khớp',
      index: true,
    },
    matchedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
)

const Order = mongoose.model<IOrderDocument>('Order', orderSchema)

export default Order

