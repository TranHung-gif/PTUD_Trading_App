import React, { useState } from 'react'
import { ArrowUpRight, Eye, LockKeyhole, Mail, User as UserIcon, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.js'

interface AuthModalProps {
  initialMode?: 'login' | 'register'
  onClose: () => void
  onSuccess: (name: string) => void
  flash: (msg: string) => void
}

export function AuthModal({
  initialMode = 'login',
  onClose,
  onSuccess,
  flash,
}: AuthModalProps) {
  const { login, register, loginWithGoogle } = useAuth()
  const [authMode, setAuthMode] = useState<'login' | 'register'>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showGooglePrompt, setShowGooglePrompt] = useState(false)
  const [googleEmailInput, setGoogleEmailInput] = useState('')
  const [googleNameInput, setGoogleNameInput] = useState('')

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      if (authMode === 'login') {
        const user = await login(email, password)
        onSuccess(user.name)
        onClose()
      } else {
        const user = await register({ name, email, password, phone })
        flash(`Đăng ký thành công! Đã gửi email chào mừng tới ${user.email}`)
        onSuccess(user.name)
        onClose()
      }
    } catch (err) {
      setError((err as Error).message || 'Đăng nhập không thành công.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoogleSignIn = async (userEmail: string, userName?: string) => {
    setError('')
    setSubmitting(true)

    try {
      const emailToUse = userEmail.trim().toLowerCase()
      const nameToUse = userName?.trim() || emailToUse.split('@')[0]
      const googleId = `g_${Math.abs(emailToUse.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0))}`

      const user = await loginWithGoogle({
        email: emailToUse,
        name: nameToUse,
        googleId,
        picture: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(nameToUse)}`,
      })

      flash(`Đăng nhập Google thành công! Đã gửi thông báo về ${user.email}`)
      onSuccess(user.name)
      onClose()
    } catch (err) {
      setError((err as Error).message || 'Đăng nhập Google thất bại.')
    } finally {
      setSubmitting(false)
      setShowGooglePrompt(false)
    }
  }

  const fillDemoAccount = () => {
    setEmail('long@finora.vn')
    setPassword('finora2024')
    setError('')
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => e.currentTarget === e.target && onClose()}
    >
      <div className="auth-modal">
        <button className="modal-close" onClick={onClose}>
          <X size={18} />
        </button>

        <div className="auth-brand">
          <div className="brand-icon">
            <ArrowUpRight size={20} />
          </div>
          <span>Finora</span>
        </div>

        <div className="auth-copy">
          <small>
            {authMode === 'login' ? 'CHÀO MỪNG TRỞ LẠI' : 'BẮT ĐẦU ĐẦU TƯ'}
          </small>
          <h2>{authMode === 'login' ? 'Đăng nhập tài khoản' : 'Tạo tài khoản mới'}</h2>
          <p>
            {authMode === 'login'
              ? 'Đăng nhập để đặt lệnh, đồng bộ danh mục và nhận thông báo qua email.'
              : 'Tạo tài khoản miễn phí để nhận mã nhà đầu tư và cập nhật giao dịch.'}
          </p>
        </div>

        <div className="auth-tabs">
          <button
            className={authMode === 'login' ? 'active' : ''}
            onClick={() => {
              setAuthMode('login')
              setError('')
            }}
          >
            Đăng nhập
          </button>
          <button
            className={authMode === 'register' ? 'active' : ''}
            onClick={() => {
              setAuthMode('register')
              setError('')
            }}
          >
            Đăng ký
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '10px 12px',
              borderRadius: '6px',
              background: '#341518',
              border: '1px solid #7d2a30',
              color: '#ff858d',
              fontSize: '11px',
              marginBottom: '12px',
            }}
          >
            {error}
          </div>
        )}

        {/* 1. Nút Tiếp tục với Google */}
        {!showGooglePrompt ? (
          <button
            className="google-button"
            type="button"
            disabled={submitting}
            onClick={() => setShowGooglePrompt(true)}
            style={{ marginBottom: '8px' }}
          >
            <span className="google-mark">G</span> Tiếp tục với Google
          </button>
        ) : (
          <div
            style={{
              background: '#151d22',
              border: '1px solid #28373e',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#eef2f5' }}>
                Đăng nhập nhanh bằng tài khoản Google:
              </span>
              <button
                type="button"
                onClick={() => setShowGooglePrompt(false)}
                style={{ background: 'none', border: 0, color: '#687781', fontSize: '10px', cursor: 'pointer' }}
              >
                Hủy
              </button>
            </div>
            <input
              type="email"
              value={googleEmailInput}
              onChange={(e) => setGoogleEmailInput(e.target.value)}
              placeholder="Nhập email Google của bạn (ví dụ: user@gmail.com)"
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '6px',
                border: '1px solid #2a373e',
                background: '#0b1013',
                color: '#fff',
                fontSize: '11px',
                marginBottom: '6px',
              }}
            />
            <input
              type="text"
              value={googleNameInput}
              onChange={(e) => setGoogleNameInput(e.target.value)}
              placeholder="Tên hiển thị (Tùy chọn)"
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '6px',
                border: '1px solid #2a373e',
                background: '#0b1013',
                color: '#fff',
                fontSize: '11px',
                marginBottom: '8px',
              }}
            />
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                disabled={!googleEmailInput.trim() || submitting}
                onClick={() => handleGoogleSignIn(googleEmailInput, googleNameInput)}
                style={{
                  flex: 1,
                  padding: '7px',
                  background: '#2add9e',
                  border: 0,
                  borderRadius: '5px',
                  color: '#07110d',
                  fontSize: '10px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {submitting ? 'Đang kết nối Google...' : 'Xác nhận đăng nhập Google'}
              </button>
              <button
                type="button"
                onClick={() => handleGoogleSignIn('trader.finora@gmail.com', 'Trader Finora')}
                style={{
                  padding: '7px 10px',
                  background: '#20292f',
                  border: '1px solid #324048',
                  borderRadius: '5px',
                  color: '#9ba7ae',
                  fontSize: '10px',
                  cursor: 'pointer',
                }}
              >
                Tài khoản Google mẫu
              </button>
            </div>
          </div>
        )}

        {/* Nút Demo Account */}
        <button
          type="button"
          onClick={fillDemoAccount}
          style={{
            width: '100%',
            padding: '8px',
            background: 'transparent',
            border: '1px dashed #28373e',
            borderRadius: '6px',
            color: '#8da0a9',
            fontSize: '10px',
            cursor: 'pointer',
          }}
        >
          🔑 Điền nhanh tài khoản có sẵn (long@finora.vn)
        </button>

        <div className="auth-divider">
          <span>hoặc dùng email & mật khẩu</span>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {authMode === 'register' && (
            <>
              <label>
                <span>Họ và tên</span>
                <div>
                  <UserIcon size={16} />
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    required
                  />
                </div>
              </label>
              <label>
                <span>Số điện thoại</span>
                <div>
                  <UserIcon size={16} />
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0912 345 678"
                  />
                </div>
              </label>
            </>
          )}

          <label>
            <span>Email</span>
            <div>
              <Mail size={16} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
              />
            </div>
          </label>

          <label>
            <span>Mật khẩu</span>
            <div>
              <LockKeyhole size={16} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ít nhất 8 ký tự"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((v) => !v)}
              >
                <Eye size={15} />
              </button>
            </div>
          </label>

          {authMode === 'login' && (
            <div className="auth-options">
              <label>
                <input type="checkbox" defaultChecked /> Ghi nhớ đăng nhập
              </label>
              <button
                type="button"
                onClick={() =>
                  flash('Đã gửi liên kết đặt lại mật khẩu về email của bạn')
                }
              >
                Quên mật khẩu?
              </button>
            </div>
          )}

          <button className="auth-submit" type="submit" disabled={submitting}>
            {submitting
              ? 'Đang xử lý...'
              : authMode === 'login'
                ? 'Đăng nhập'
                : 'Tạo tài khoản'}{' '}
            <ArrowUpRight size={16} />
          </button>
        </form>

        <p className="auth-legal">
          📧 Hệ thống sẽ tự động gửi email xác nhận và thông báo kết quả giao dịch về hòm thư của bạn.
        </p>
      </div>
    </div>
  )
}
