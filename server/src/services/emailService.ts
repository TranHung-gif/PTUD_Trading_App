import nodemailer, { type Transporter } from 'nodemailer'
import { env } from '../config/env.js'

let transporter: Transporter | null = null

function getTransporter(): Transporter | null {
  if (transporter) return transporter

  // Nếu người dùng đã cấu hình SMTP
  if (env.SMTP_USER && env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465, // true for 465, false for other ports
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    })
    return transporter
  }

  return null
}

interface SendMailOptions {
  to: string
  subject: string
  html: string
}

async function sendMail({ to, subject, html }: SendMailOptions): Promise<boolean> {
  const mailer = getTransporter()

  if (mailer) {
    try {
      await mailer.sendMail({
        from: env.SMTP_FROM,
        to,
        subject,
        html,
      })
      console.log(`📧 [EMAIL SENT] Đến: ${to} | Tiêu đề: "${subject}"`)
      return true
    } catch (error) {
      console.error(`❌ [EMAIL ERROR] Không thể gửi tới ${to}:`, (error as Error).message)
      return false
    }
  } else {
    // Chế độ DEV: In giao diện email ra console để người dùng kiểm tra ngay lập tức
    console.log(`
┌─────────────────────────────────────────────────────────────┐
│ 📧 [DEV EMAIL SIMULATION]                                  │
│ To:      ${to.padEnd(50)}│
│ Subject: ${subject.padEnd(50)}│
│ Status:  Simulated (Cấu hình SMTP trong server/.env để gửi thật)│
└─────────────────────────────────────────────────────────────┘
    `)
    return true
  }
}

// 1. Email chào mừng nhà đầu tư
export async function sendWelcomeEmail(
  to: string,
  name: string,
  investorCode: string,
): Promise<boolean> {
  const subject = `🎉 Chào mừng bạn gia nhập Finora Securities - Mã NĐT: ${investorCode}`
  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #0b0f12; color: #eef2f5; padding: 30px; border-radius: 12px; max-width: 600px; margin: auto;">
      <div style="text-align: center; margin-bottom: 25px;">
        <h1 style="color: #2add9e; margin: 0; font-size: 28px; letter-spacing: -0.5px;">Finora Securities</h1>
        <p style="color: #8da0a9; font-size: 14px; margin-top: 5px;">Nền tảng giao dịch chứng khoán thông minh</p>
      </div>
      
      <div style="background-color: #12191d; border: 1px solid #23342d; border-radius: 8px; padding: 25px; margin-bottom: 20px;">
        <h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">Xin chào ${name},</h2>
        <p style="color: #cbd5db; line-height: 1.6; font-size: 14px;">
          Tài khoản đầu tư chứng khoán của bạn tại Finora đã được kích hoạt thành công! Bạn có thể bắt đầu theo dõi thị trường và thực hiện giao dịch ngay hôm nay.
        </p>
        
        <div style="background-color: #182822; border-left: 4px solid #2add9e; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #8fa59c; font-size: 12px; text-transform: uppercase; font-weight: bold;">MÃ NHÀ ĐẦU TƯ CỦA BẠN</p>
          <p style="margin: 5px 0 0; color: #2add9e; font-size: 22px; font-weight: bold; letter-spacing: 1px;">${investorCode}</p>
        </div>

        <p style="color: #cbd5db; line-height: 1.6; font-size: 14px;">
          Sức mua trải nghiệm ban đầu: <b style="color: #ffffff;">125.680.000 ₫</b>.
        </p>
      </div>

      <div style="text-align: center; color: #56646c; font-size: 12px;">
        <p>Email này được gửi tự động từ hệ thống Finora Securities.</p>
        <p>© 2026 Finora App. Bảo lưu mọi quyền.</p>
      </div>
    </div>
  `

  return sendMail({ to, subject, html })
}

// 2. Email thông báo kết quả khớp lệnh
export async function sendOrderConfirmationEmail(
  to: string,
  name: string,
  order: {
    orderCode: string
    symbol: string
    side: 'Mua' | 'Bán'
    quantity: number
    price: number
    totalAmount: number
    fee: number
    status: string
  },
): Promise<boolean> {
  const isBuy = order.side === 'Mua'
  const actionColor = isBuy ? '#2add9e' : '#ff6b72'
  const formatVnd = (val: number) => new Intl.NumberFormat('vi-VN').format(Math.round(val))

  const subject = `🔔 [Finora] Thông báo ${order.status.toLowerCase()} lệnh ${order.side} ${order.symbol} (${order.orderCode})`
  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #0b0f12; color: #eef2f5; padding: 30px; border-radius: 12px; max-width: 600px; margin: auto;">
      <div style="border-bottom: 1px solid #23342d; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
        <h2 style="color: #2add9e; margin: 0; font-size: 22px;">Finora Trading</h2>
        <span style="background-color: ${actionColor}22; color: ${actionColor}; padding: 4px 10px; border-radius: 20px; font-weight: bold; font-size: 12px;">
          ${order.status}
        </span>
      </div>

      <div style="background-color: #12191d; border: 1px solid #20292f; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <p style="color: #cbd5db; margin-top: 0; font-size: 14px;">Kính gửi <b>${name}</b>,</p>
        <p style="color: #8da0a9; font-size: 13px; line-height: 1.5;">
          Lệnh giao dịch của quý khách đã được xử lý trên hệ thống với chi tiết như sau:
        </p>

        <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px;">
          <tr style="border-bottom: 1px solid #1c252a;">
            <td style="padding: 10px 0; color: #728189;">Mã lệnh:</td>
            <td style="padding: 10px 0; text-align: right; color: #ffffff; font-weight: bold;">${order.orderCode}</td>
          </tr>
          <tr style="border-bottom: 1px solid #1c252a;">
            <td style="padding: 10px 0; color: #728189;">Mã cổ phiếu:</td>
            <td style="padding: 10px 0; text-align: right; color: #ffffff; font-weight: bold;">${order.symbol}</td>
          </tr>
          <tr style="border-bottom: 1px solid #1c252a;">
            <td style="padding: 10px 0; color: #728189;">Loại giao dịch:</td>
            <td style="padding: 10px 0; text-align: right; color: ${actionColor}; font-weight: bold;">${order.side}</td>
          </tr>
          <tr style="border-bottom: 1px solid #1c252a;">
            <td style="padding: 10px 0; color: #728189;">Khối lượng khớp:</td>
            <td style="padding: 10px 0; text-align: right; color: #ffffff;">${formatVnd(order.quantity)} CP</td>
          </tr>
          <tr style="border-bottom: 1px solid #1c252a;">
            <td style="padding: 10px 0; color: #728189;">Giá khớp:</td>
            <td style="padding: 10px 0; text-align: right; color: #ffffff;">${formatVnd(order.price)} ₫</td>
          </tr>
          <tr style="border-bottom: 1px solid #1c252a;">
            <td style="padding: 10px 0; color: #728189;">Phí giao dịch (0.15%):</td>
            <td style="padding: 10px 0; text-align: right; color: #8da0a9;">${formatVnd(order.fee)} ₫</td>
          </tr>
          <tr>
            <td style="padding: 12px 0 0; color: #cbd5db; font-weight: bold;">Tổng giá trị:</td>
            <td style="padding: 12px 0 0; text-align: right; color: #2add9e; font-size: 16px; font-weight: bold;">
              ${formatVnd(order.totalAmount)} ₫
            </td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; color: #56646c; font-size: 11px;">
        <p>Đây là thông báo tự động. Nếu quý khách không thực hiện lệnh này, vui lòng liên hệ bộ phận hỗ trợ ngay lập tức.</p>
      </div>
    </div>
  `

  return sendMail({ to, subject, html })
}

// 3. Email thông báo bảo mật
export async function sendSecurityAlertEmail(
  to: string,
  name: string,
  action: string,
): Promise<boolean> {
  const subject = `🛡️ [Finora] Cảnh báo bảo mật tài khoản`
  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #0b0f12; color: #eef2f5; padding: 30px; border-radius: 12px; max-width: 600px; margin: auto;">
      <h2 style="color: #2add9e; margin-top: 0;">Finora Security Alert</h2>
      <p style="color: #cbd5db; font-size: 14px;">Xin chào <b>${name}</b>,</p>
      <p style="color: #cbd5db; font-size: 14px; line-height: 1.6;">
        Tài khoản của bạn vừa thực hiện hành động: <b style="color: #ffffff;">${action}</b> vào lúc ${new Date().toLocaleString('vi-VN')}.
      </p>
      <p style="color: #8da0a9; font-size: 12px;">Nếu bạn không thực hiện thay đổi này, hãy liên hệ ngay với chúng tôi để bảo vệ tài khoản.</p>
    </div>
  `

  return sendMail({ to, subject, html })
}
