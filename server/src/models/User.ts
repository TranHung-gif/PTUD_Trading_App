import mongoose, { Schema, Document } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUserDocument extends Document {
  name: string
  email: string
  password?: string
  googleId?: string
  phone: string
  investorCode: string
  avatar: string
  settings: {
    darkMode: boolean
    twoFactor: boolean
    priceAlerts: boolean
    orderAlerts: boolean
  }
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, 'Họ và tên là bắt buộc'],
      trim: true,
      minlength: [2, 'Tên phải có ít nhất 2 ký tự'],
      maxlength: [50, 'Tên không được vượt quá 50 ký tự'],
    },
    email: {
      type: String,
      required: [true, 'Email là bắt buộc'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ'],
    },
    password: {
      type: String,
      minlength: [8, 'Mật khẩu phải có ít nhất 8 ký tự'],
      select: false, // Don't include password in queries by default
    },
    googleId: {
      type: String,
      sparse: true,
      index: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    investorCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    settings: {
      darkMode: { type: Boolean, default: true },
      twoFactor: { type: Boolean, default: true },
      priceAlerts: { type: Boolean, default: true },
      orderAlerts: { type: Boolean, default: true },
      language: { type: String, enum: ['vi', 'en'], default: 'vi' },
    },
  },
  {
    timestamps: true,
  },
)

// Generate unique investor code before saving
userSchema.pre('save', async function (next) {
  // Generate investor code for new users
  if (this.isNew && !this.investorCode) {
    const randomNum = Math.floor(Math.random() * 900000) + 100000
    this.investorCode = `VN00FNR${randomNum}`
  }

  // Hash password only if it was modified and present
  if (!this.password || !this.isModified('password')) return next()

  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error as Error)
  }
})

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  if (!this.password) return false
  return bcrypt.compare(candidatePassword, this.password)
}

// Remove sensitive data when converting to JSON
userSchema.set('toJSON', {
  transform(_doc, ret) {
    const record = ret as unknown as Record<string, unknown>
    delete record.password
    delete record.__v
    return record
  },
})

const User = mongoose.model<IUserDocument>('User', userSchema)

export default User
