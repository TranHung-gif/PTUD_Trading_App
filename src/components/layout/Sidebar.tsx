import React, { useState } from 'react'
import {
  ArrowUpRight,
  CircleDollarSign,
  ChevronDown,
  LayoutDashboard,
  LineChart,
  LogIn,
  LogOut,
  Settings,
  User as UserIcon,
  UserPlus,
  WalletCards,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.js'
import { useLanguage } from '../../context/LanguageContext.js'

interface SidebarProps {
  page: string
  setPage: (page: string) => void
  onOpenAuth: (mode: 'login' | 'register') => void
  flash: (msg: string) => void
}

export function Sidebar({ page, setPage, onOpenAuth, flash }: SidebarProps) {
  const { user, isAuthenticated, logout } = useAuth()
  const { t } = useLanguage()
  const [profileOpen, setProfileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    setProfileOpen(false)
    flash('Đã chuyển về chế độ tài khoản ảo')
  }

  const getInitials = (name?: string) => {
    if (!name) return 'VA'
    const parts = name.trim().split(' ')
    return parts.length > 1
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : name.slice(0, 2).toUpperCase()
  }

  const navWork = [
    { key: 'Tổng quan', label: t('nav_overview'), icon: LayoutDashboard },
    { key: 'Giao dịch', label: t('nav_trading'), icon: LineChart },
    { key: 'Danh mục', label: t('nav_portfolio'), icon: WalletCards },
  ]

  const navManage = [
    { key: 'Lệnh của tôi', label: t('nav_orders'), icon: CircleDollarSign },
    { key: 'Cài đặt', label: t('nav_settings'), icon: Settings },
  ]

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">
          <ArrowUpRight size={20} />
        </div>
        <span>Finora</span>
      </div>

      <nav>
        <div className="nav-label">{t('workspace')}</div>
        {navWork.map(({ key, label, icon: Icon }) => (
          <button
            onClick={() => setPage(key)}
            className={page === key ? 'nav-item active' : 'nav-item'}
            key={key}
          >
            <Icon size={18} />
            <span>{label}</span>
            {page === key && <span className="nav-dot" />}
          </button>
        ))}

        <div className="nav-label nav-label-space">{t('management')}</div>
        {navManage.map(({ key, label, icon: Icon }) => (
          <button
            onClick={() => setPage(key)}
            className={page === key ? 'nav-item active' : 'nav-item'}
            key={key}
          >
            <Icon size={18} />
            <span>{label}</span>
            {page === key && <span className="nav-dot" />}
          </button>
        ))}
      </nav>

      <div className="market-status">
        <span className="status-dot" />
        <div>
          <b>{t('market_open')}</b>
          <small>{t('market_close_time')}</small>
        </div>
      </div>

      <div className="profile-wrap">
        <button
          className="profile"
          onClick={() => setProfileOpen((open) => !open)}
        >
          <div className={`avatar ${isAuthenticated ? '' : 'virtual'}`}>
            {isAuthenticated ? getInitials(user?.name) : 'VA'}
          </div>
          <div>
            <b>{isAuthenticated ? user?.name : t('virtual_account')}</b>
            <small>
              {isAuthenticated ? user?.email : 'Dùng thử không cần đăng nhập'}
            </small>
          </div>
          <ChevronDown size={16} />
        </button>

        {profileOpen && (
          <div className="profile-menu">
            <div className="account-mode">
              <span className="status-dot" />
              <div>
                <b>{isAuthenticated ? t('verified_account') : t('trial_mode')}</b>
                <small>
                  {isAuthenticated
                    ? `Mã NĐT: ${user?.investorCode || 'Đã xác minh'}`
                    : 'Lệnh thật yêu cầu đăng nhập'}
                </small>
              </div>
            </div>

            {isAuthenticated ? (
              <>
                <button
                  onClick={() => {
                    setPage('Cài đặt')
                    setProfileOpen(false)
                  }}
                >
                  <UserIcon size={15} />
                  {t('profile_settings')}
                </button>
                <button onClick={handleLogout}>
                  <LogOut size={15} />
                  {t('logout')}
                </button>
              </>
            ) : (
              <>
                <button
                  className="menu-primary"
                  onClick={() => {
                    onOpenAuth('login')
                    setProfileOpen(false)
                  }}
                >
                  <LogIn size={15} />
                  {t('login')}
                </button>
                <button
                  onClick={() => {
                    onOpenAuth('register')
                    setProfileOpen(false)
                  }}
                >
                  <UserPlus size={15} />
                  {t('register')}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </aside>
  )
}
