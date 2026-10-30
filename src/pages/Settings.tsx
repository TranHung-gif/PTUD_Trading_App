import React, { useState, useEffect } from 'react'
import {
  ArrowUpRight,
  Bell,
  Check,
  CheckCircle2,
  Clock3,
  Globe,
  LockKeyhole,
  Moon,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.js'
import { useLanguage, type Language } from '../context/LanguageContext.js'
import { authApi } from '../services/api.js'

interface SettingsProps {
  darkMode: boolean
  setDarkMode: (val: boolean | ((prev: boolean) => boolean)) => void
  flash: (msg: string) => void
}

export function Settings({ darkMode, setDarkMode, flash }: SettingsProps) {
  const { user, updateProfile, isAuthenticated } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const [settingsTab, setSettingsTab] = useState('Hồ sơ cá nhân')

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [twoFactor, setTwoFactor] = useState(true)
  const [priceAlerts, setPriceAlerts] = useState(true)
  const [orderAlerts, setOrderAlerts] = useState(true)

  // Đổi mật khẩu
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)
  const [showPasswordBox, setShowPasswordBox] = useState(false)

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setPhone(user.phone || '')
      if (user.settings) {
        setTwoFactor(user.settings.twoFactor ?? true)
        setPriceAlerts(user.settings.priceAlerts ?? true)
        setOrderAlerts(user.settings.orderAlerts ?? true)
        if (user.settings.language && user.settings.language !== language) {
          setLanguage(user.settings.language as Language)
        }
      }
    }
  }, [user])

  const handleSaveProfile = async () => {
    if (!isAuthenticated) {
      flash('Vui lòng đăng nhập để lưu thông tin')
      return
    }

    try {
      await updateProfile({
        name,
        phone,
        settings: {
          darkMode,
          twoFactor,
          priceAlerts,
          orderAlerts,
          language,
        },
      })
      flash('Đã lưu thông tin hồ sơ lên máy chủ MongoDB!')
    } catch (err) {
      flash((err as Error).message || 'Không thể lưu hồ sơ')
    }
  }

  const handleSelectLanguage = async (newLang: Language) => {
    setLanguage(newLang)
    const langName = newLang === 'vi' ? 'Tiếng Việt' : 'English'
    flash(`${t('lang_changed_toast')} ${langName}`)

    if (isAuthenticated) {
      try {
        await updateProfile({
          settings: {
            darkMode,
            twoFactor,
            priceAlerts,
            orderAlerts,
            language: newLang,
          },
        })
      } catch (err) {
        console.error('Lỗi lưu ngôn ngữ:', err)
      }
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPassword || !newPassword) {
      flash('Vui lòng nhập đầy đủ mật khẩu')
      return
    }
    setChangingPassword(true)
    try {
      await authApi.changePassword({ currentPassword, newPassword })
      flash('Đổi mật khẩu thành công!')
      setCurrentPassword('')
      setNewPassword('')
      setShowPasswordBox(false)
    } catch (err) {
      flash((err as Error).message || 'Đổi mật khẩu không thành công')
    } finally {
      setChangingPassword(false)
    }
  }

  const navTabs = [
    ['Hồ sơ cá nhân', UserIcon, t('tab_profile')],
    ['Bảo mật & 2FA', ShieldCheck, t('tab_security')],
    ['Thông báo', Bell, t('tab_notifications')],
    ['Giao diện', Moon, t('tab_appearance')],
    ['Ngôn ngữ', Globe, t('tab_language')],
  ]

  return (
    <section className="page-content settings-page">
      <div className="settings-nav panel">
        {navTabs.map(([key, Icon, label]) => (
          <button
            key={key as string}
            onClick={() => setSettingsTab(key as string)}
            className={settingsTab === key ? 'active' : ''}
          >
            <Icon size={17} />
            {label as string}
          </button>
        ))}
      </div>

      <div className="panel settings-card">
        <div className="section-title">
          <div>
            <b>
              {settingsTab === 'Hồ sơ cá nhân'
                ? t('tab_profile')
                : settingsTab === 'Bảo mật & 2FA'
                  ? t('tab_security')
                  : settingsTab === 'Thông báo'
                    ? t('tab_notifications')
                    : settingsTab === 'Giao diện'
                      ? t('tab_appearance')
                      : t('tab_language')}
            </b>
            <small>
              {settingsTab === 'Hồ sơ cá nhân'
                ? 'Quản lý thông tin tài khoản của bạn'
                : settingsTab === 'Bảo mật & 2FA'
                  ? 'Kiểm soát đăng nhập và xác thực giao dịch'
                  : settingsTab === 'Thông báo'
                    ? 'Chọn những cập nhật bạn muốn nhận'
                    : settingsTab === 'Giao diện'
                      ? 'Tùy chỉnh trải nghiệm hiển thị'
                      : t('choose_language_desc')}
            </small>
          </div>
        </div>

        {/* Tab 1: Hồ sơ */}
        {settingsTab === 'Hồ sơ cá nhân' && (
          <>
            <div className="settings-profile">
              <div className="avatar large">
                {name ? name.slice(0, 1).toUpperCase() : 'U'}
              </div>
              <div>
                <b>{name || 'Chưa đăng nhập'}</b>
                <small>
                  {user ? `Mã NĐT: ${user.investorCode} · Đã xác minh` : 'Tài khoản khách'}
                </small>
              </div>
              <button onClick={() => flash('Chức năng tải ảnh lên đang được cập nhật')}>
                Thay ảnh
              </button>
            </div>

            <div className="form-grid">
              <label>
                <span>Họ và tên</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập họ và tên"
                />
              </label>
              <label>
                <span>Email</span>
                <input
                  value={user?.email || 'guest@finora.vn'}
                  readOnly
                  style={{ opacity: 0.7 }}
                />
              </label>
              <label>
                <span>Số điện thoại</span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Nhập số điện thoại"
                />
              </label>
              <label>
                <span>Mã nhà đầu tư</span>
                <input value={user?.investorCode || 'VN00FNR284'} readOnly />
              </label>
            </div>

            <div className="settings-actions">
              <button
                onClick={() => {
                  setName(user?.name || '')
                  setPhone(user?.phone || '')
                }}
              >
                Hủy thay đổi
              </button>
              <button className="primary-action" onClick={handleSaveProfile}>
                Lưu thay đổi
              </button>
            </div>
          </>
        )}

        {/* Tab 2: Bảo mật */}
        {settingsTab === 'Bảo mật & 2FA' && (
          <div className="settings-options">
            <div className="security-row">
              <div>
                <ShieldCheck size={19} />
                <span>
                  <b>Xác thực hai lớp</b>
                  <small>Tăng cường bảo mật khi đăng nhập và đặt lệnh</small>
                </span>
              </div>
              <button
                onClick={() => setTwoFactor((v) => !v)}
                className={`toggle ${twoFactor ? 'active' : ''}`}
              >
                <i />
              </button>
            </div>

            <div className="security-row">
              <div>
                <LockKeyhole size={19} />
                <span>
                  <b>Đổi mật khẩu</b>
                  <small>Cập nhật mật khẩu đăng nhập của bạn</small>
                </span>
              </div>
              <button
                className="setting-link"
                onClick={() => setShowPasswordBox((v) => !v)}
              >
                {showPasswordBox ? 'Đóng lại' : 'Thực hiện'}
              </button>
            </div>

            {showPasswordBox && (
              <form
                onSubmit={handleChangePassword}
                style={{
                  padding: '16px',
                  background: '#12191d',
                  borderRadius: '8px',
                  border: '1px solid #23342d',
                  display: 'grid',
                  gap: '12px',
                }}
              >
                <label>
                  <span style={{ fontSize: '10px', color: '#8898a1', display: 'block', marginBottom: '4px' }}>
                    Mật khẩu hiện tại
                  </span>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      background: '#0c1114',
                      border: '1px solid #29343a',
                      borderRadius: '6px',
                      color: '#d8e0e4',
                      fontSize: '11px',
                    }}
                    required
                  />
                </label>
                <label>
                  <span style={{ fontSize: '10px', color: '#8898a1', display: 'block', marginBottom: '4px' }}>
                    Mật khẩu mới (ít nhất 8 ký tự)
                  </span>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      background: '#0c1114',
                      border: '1px solid #29343a',
                      borderRadius: '6px',
                      color: '#d8e0e4',
                      fontSize: '11px',
                    }}
                    required
                  />
                </label>
                <button
                  type="submit"
                  disabled={changingPassword}
                  style={{
                    padding: '8px 14px',
                    background: '#2add9e',
                    border: 0,
                    borderRadius: '6px',
                    color: '#07110d',
                    fontWeight: 700,
                    fontSize: '10px',
                    cursor: 'pointer',
                    width: 'fit-content',
                  }}
                >
                  {changingPassword ? 'Đang cập nhật...' : 'Xác nhận đổi mật khẩu'}
                </button>
              </form>
            )}

            <div className="security-row">
              <div>
                <Clock3 size={19} />
                <span>
                  <b>Phiên đăng nhập</b>
                  <small>1 thiết bị đang hoạt động</small>
                </span>
              </div>
              <button
                className="setting-link"
                onClick={() => flash('Đã đăng xuất khỏi các thiết bị khác')}
              >
                Đăng xuất khác
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Thông báo */}
        {settingsTab === 'Thông báo' && (
          <div className="settings-options">
            <div className="security-row">
              <div>
                <ArrowUpRight size={19} />
                <span>
                  <b>Cảnh báo biến động giá</b>
                  <small>Thông báo khi mã theo dõi biến động mạnh</small>
                </span>
              </div>
              <button
                onClick={() => setPriceAlerts((v) => !v)}
                className={`toggle ${priceAlerts ? 'active' : ''}`}
              >
                <i />
              </button>
            </div>

            <div className="security-row">
              <div>
                <CheckCircle2 size={19} />
                <span>
                  <b>Cập nhật trạng thái lệnh</b>
                  <small>Thông báo khi lệnh được khớp hoặc hủy</small>
                </span>
              </div>
              <button
                onClick={() => setOrderAlerts((v) => !v)}
                className={`toggle ${orderAlerts ? 'active' : ''}`}
              >
                <i />
              </button>
            </div>
          </div>
        )}

        {/* Tab 4: Giao diện */}
        {settingsTab === 'Giao diện' && (
          <div className="settings-options">
            <div className="security-row">
              <div>
                <Moon size={19} />
                <span>
                  <b>Giao diện tối</b>
                  <small>Chế độ tối được tối ưu cho màn hình giao dịch</small>
                </span>
              </div>
              <button
                onClick={() => {
                  setDarkMode((v) => !v)
                  flash(!darkMode ? 'Đã bật giao diện tối' : 'Đã chuyển giao diện dịu sáng')
                }}
                className={`toggle ${darkMode ? 'active' : ''}`}
              >
                <i />
              </button>
            </div>
          </div>
        )}

        {/* Tab 5: Ngôn ngữ */}
        {settingsTab === 'Ngôn ngữ' && (
          <div className="settings-options">
            <div style={{ padding: '0 0 10px', color: '#8da0a9', fontSize: '11px' }}>
              {t('choose_language_desc')}
            </div>

            {/* Option 1: Tiếng Việt */}
            <div
              onClick={() => handleSelectLanguage('vi')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 18px',
                borderRadius: '8px',
                border: language === 'vi' ? '1px solid #2add9e' : '1px solid #23342d',
                background: language === 'vi' ? '#14251f' : '#101b17',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{ fontSize: '26px' }}>🇻🇳</span>
                <div>
                  <b style={{ color: '#ffffff', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {t('vietnamese')}
                    {language === 'vi' && (
                      <span
                        style={{
                          background: '#2add9e22',
                          color: '#2add9e',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '9px',
                        }}
                      >
                        Đang sử dụng
                      </span>
                    )}
                  </b>
                  <small style={{ color: '#8da0a9', fontSize: '10px', marginTop: '3px', display: 'block' }}>
                    {t('vietnamese_desc')}
                  </small>
                </div>
              </div>
              {language === 'vi' && (
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: '#2add9e',
                    display: 'grid',
                    placeItems: 'center',
                    color: '#07110d',
                  }}
                >
                  <Check size={14} strokeWidth={3} />
                </div>
              )}
            </div>

            {/* Option 2: English */}
            <div
              onClick={() => handleSelectLanguage('en')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 18px',
                borderRadius: '8px',
                border: language === 'en' ? '1px solid #2add9e' : '1px solid #23342d',
                background: language === 'en' ? '#14251f' : '#101b17',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{ fontSize: '26px' }}>🇬🇧</span>
                <div>
                  <b style={{ color: '#ffffff', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {t('english')}
                    {language === 'en' && (
                      <span
                        style={{
                          background: '#2add9e22',
                          color: '#2add9e',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '9px',
                        }}
                      >
                        Active
                      </span>
                    )}
                  </b>
                  <small style={{ color: '#8da0a9', fontSize: '10px', marginTop: '3px', display: 'block' }}>
                    {t('english_desc')}
                  </small>
                </div>
              </div>
              {language === 'en' && (
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: '#2add9e',
                    display: 'grid',
                    placeItems: 'center',
                    color: '#07110d',
                  }}
                >
                  <Check size={14} strokeWidth={3} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
