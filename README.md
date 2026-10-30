# 📈 Finora Trading Web App (MERN Stack)

Ứng dụng web giao dịch chứng khoán trực tuyến xây dựng theo mô hình **MERN (MongoDB, Express, React, Node.js)** + **TypeScript** + **Tailwind CSS**.

---

## 🚀 Cấu trúc dự án

```
finora-trading-app/
├── src/                          # FRONTEND (React 19 + TypeScript + Vite)
│   ├── components/
│   │   ├── auth/AuthModal.tsx    # Modal Đăng nhập / Đăng ký thực tế
│   │   ├── common/StockMark.tsx  # Icon đại diện mã cổ phiếu
│   │   └── layout/               # Sidebar, Header, MarketStrip
│   ├── context/
│   │   └── AuthContext.tsx       # Quản lý User Session & Bearer JWT Token
│   ├── pages/
│   │   ├── Overview.tsx          # Tổng quan (Tài sản ròng, Donut chart, Lợi nhuận)
│   │   ├── Trading.tsx           # Sàn giao dịch (Watchlist, Candlestick, Đặt lệnh)
│   │   ├── Portfolio.tsx         # Danh mục tài sản đang nắm giữ & lãi/lỗ
│   │   ├── Orders.tsx            # Lịch sử lệnh & chức năng hủy lệnh
│   │   └── Settings.tsx          # Hồ sơ, đổi mật khẩu, 2FA, Dark Mode
│   ├── services/
│   │   └── api.ts                # API client giao tiếp với Express Backend
│   ├── types/                    # TypeScript interfaces
│   ├── utils/                    # Helper format tiền VND, %
│   ├── App.tsx                   # Component trung tâm kết nối các module
│   └── index.css                 # Dark theme styling & animations
│
├── server/                       # BACKEND (Express + Node.js + Mongoose)
│   ├── src/
│   │   ├── config/               # MongoDB connection & biến môi trường (.env)
│   │   ├── controllers/          # authController, stockController, orderController, portfolioController, watchlistController
│   │   ├── middleware/           # auth (JWT check), validate, errorHandler
│   │   ├── models/               # User, Stock, Order, Portfolio, Watchlist
│   │   ├── routes/               # /api/auth, /api/stocks, /api/orders, /api/portfolio, /api/watchlist
│   │   ├── utils/                # JWT generate/verify
│   │   ├── index.ts              # Express Server entry point (Port 5000)
│   │   └── seed.ts               # Script nạp dữ liệu mẫu
│   ├── package.json
│   └── tsconfig.json
│
└── package.json                  # Scripts điều khiển toàn bộ dự án
```

---

## ⚡ Hướng dẫn cài đặt & Chạy ứng dụng

### 1. Chuẩn bị MongoDB
Đảm bảo MongoDB Server đang chạy trên máy (mặc định `mongodb://localhost:27017/finora`).

### 2. Cấu hình Email SMTP & Google OAuth (Tùy chọn)
Trong file `server/.env`:
```env
# Cấu hình gửi mail qua Gmail SMTP (Dùng App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
SMTP_FROM="Finora Securities" <no-reply@finora.vn>

# Google OAuth Client ID (tùy chọn)
GOOGLE_CLIENT_ID=
```
> *Lưu ý: Nếu chưa điền tài khoản SMTP, hệ thống sẽ tự động bật chế độ **Email Simulation** (ghi log chi tiết toàn bộ nội dung email lên terminal server) mà không làm gián đoạn hay crash ứng dụng.*

### 3. Khởi động Backend (Express API Server)
Mở một cửa sổ Terminal tại thư mục dự án và chạy:
```bash
npm run server
```
> Server sẽ chạy tại **`http://localhost:5000`** và tự động kết nối MongoDB.

*(Tuỳ chọn) Nạp lại dữ liệu mẫu:*
```bash
npm run server:seed
```

### 4. Khởi động Frontend (React Dev Server)
Tại một cửa sổ Terminal khác (hoặc dev server có sẵn của Vite):
```bash
npm run dev
```
> Truy cập ứng dụng tại **`http://localhost:8443`** (hoặc port do Vite thông báo).

---

## 🔑 Tài khoản mẫu để kiểm thử

| Email | Mật khẩu | Mã NĐT | Ghi chú |
|-------|----------|--------|---------|
| `long@finora.vn` | `finora2024` | `VN00FNR868998` | Đã có sẵn 4 mã CK trong danh mục & lịch sử lệnh |
| `minh@finora.vn` | `finora2024` | `VN00FNR376084` | Tài khoản phụ |

---

## 🎯 Các tính năng Full-Stack đã hoàn thành

1. **Xác thực người dùng (Auth)**:
   - Đăng ký tài khoản mới (tự sinh mã NĐT duy nhất `VN00FNR...`).
   - Đăng nhập cấp phát JWT Access Token & Refresh Token.
   - Nút 1-click dùng tài khoản mẫu để trải nghiệm nhanh.
   - Đổi mật khẩu có kiểm tra mật khẩu hiện tại.
   - Cập nhật thông tin cá nhân và cài đặt giao diện/thông báo đồng bộ lên MongoDB.

2. **Dữ liệu thị trường (Stocks)**:
   - Danh sách cổ phiếu (FPT, VNM, HPG, VIC, MWG, TCB,...) kèm giá, biến động, dữ liệu nến Candlestick.
   - Tìm kiếm cổ phiếu theo tên hoặc mã từ thanh tìm kiếm toàn cục.

3. **Giao dịch (Trading)**:
   - Đặt lệnh **Mua / Bán** (LO, ATO, ATC) với phím chọn nhanh % sức mua (25%, 50%, 75%, 100%).
   - Tự động kiểm tra sức mua tiền mặt hoặc số lượng cổ phiếu có sẵn.
   - Tự động tính phí giao dịch 0.15% và cập nhật ngay vào số dư & danh mục tài sản trong MongoDB.

4. **Danh mục đầu tư (Portfolio)**:
   - Tính toán lãi/lỗ theo thời gian thực dựa trên giá vốn trung bình (`avgPrice`) và thị giá hiện tại.
   - Thống kê tài sản ròng, phân bổ danh mục.

5. **Lệnh của tôi (Orders)**:
   - Lọc theo trạng thái: *Tất cả*, *Chờ khớp*, *Đã khớp*, *Đã hủy*.
   - Cho phép hủy lệnh *Chờ khớp* và tự động hoàn trả sức mua tiền mặt.

