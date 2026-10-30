import dotenv from 'dotenv'

dotenv.config()

export const env = {
  PORT: parseInt(process.env.PORT || '5000'),
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/finora',
  JWT_SECRET: process.env.JWT_SECRET || 'finora-jwt-secret-key-2024',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'finora-refresh-secret-key-2024',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:8443',
  // Google OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  // Email Service (SMTP)
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587'),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  SMTP_FROM: process.env.SMTP_FROM || 'Finora Trading App <no-reply@finora.vn>',
} as const
