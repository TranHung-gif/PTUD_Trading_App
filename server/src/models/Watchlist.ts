import mongoose, { Schema, Document } from 'mongoose'

export interface IWatchlistDocument extends Document {
  user: mongoose.Types.ObjectId
  symbols: string[]
  createdAt: Date
  updatedAt: Date
}

const watchlistSchema = new Schema<IWatchlistDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    symbols: {
      type: [String],
      default: ['FPT', 'VNM', 'HPG', 'VIC'],
    },
  },
  {
    timestamps: true,
  },
)

const Watchlist = mongoose.model<IWatchlistDocument>('Watchlist', watchlistSchema)

export default Watchlist

