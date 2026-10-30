import React, { createContext, useContext, useState, useEffect } from 'react'

export type Language = 'vi' | 'en'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations: Record<Language, Record<string, string>> = {
  vi: {
    // Nav
    workspace: 'KHÔNG GIAN LÀM VIỆC',
    management: 'QUẢN LÝ',
    nav_overview: 'Tổng quan',
    nav_trading: 'Giao dịch',
    nav_portfolio: 'Danh mục',
    nav_orders: 'Lệnh của tôi',
    nav_settings: 'Cài đặt',
    market_open: 'Thị trường đang mở',
    market_close_time: 'Đóng cửa lúc 15:00',
    virtual_account: 'Tài khoản ảo',
    verified_account: 'Tài khoản đã xác thực',
    trial_mode: 'Chế độ trải nghiệm',
    login: 'Đăng nhập',
    logout: 'Đăng xuất',
    register: 'Tạo tài khoản mới',
    profile_settings: 'Hồ sơ & cài đặt',
    // Header
    search_stock: 'Tìm mã cổ phiếu',
    purchasing_power: 'Sức mua',
    live_data: 'Dữ liệu trực tiếp',
    notifications: 'Thông báo',
    new_notices: 'thông báo mới',
    view_all_activities: 'Xem tất cả hoạt động',
    // Settings tabs
    tab_profile: 'Hồ sơ cá nhân',
    tab_security: 'Bảo mật & 2FA',
    tab_notifications: 'Thông báo',
    tab_appearance: 'Giao diện',
    tab_language: 'Ngôn ngữ',
    // Language settings page
    choose_language: 'Tùy chọn ngôn ngữ hiển thị',
    choose_language_desc: 'Chọn ngôn ngữ giao diện mà bạn mong muốn sử dụng trên Finora.',
    vietnamese: 'Tiếng Việt',
    vietnamese_desc: 'Giao diện tiếng Việt chuẩn hóa cho thị trường chứng khoán Việt Nam (Mặc định).',
    english: 'English (Tiếng Anh)',
    english_desc: 'English interface for international investors and global trading terms.',
    save_changes: 'Lưu thay đổi',
    cancel_changes: 'Hủy thay đổi',
    lang_changed_toast: 'Đã chuyển ngôn ngữ hiển thị sang',
  },
  en: {
    // Nav
    workspace: 'WORKSPACE',
    management: 'MANAGEMENT',
    nav_overview: 'Overview',
    nav_trading: 'Trading',
    nav_portfolio: 'Portfolio',
    nav_orders: 'My Orders',
    nav_settings: 'Settings',
    market_open: 'Market is open',
    market_close_time: 'Closes at 15:00',
    virtual_account: 'Demo Account',
    verified_account: 'Verified Account',
    trial_mode: 'Trial Mode',
    login: 'Log In',
    logout: 'Log Out',
    register: 'Create Account',
    profile_settings: 'Profile & Settings',
    // Header
    search_stock: 'Search stocks',
    purchasing_power: 'Buying Power',
    live_data: 'Live Data',
    notifications: 'Notifications',
    new_notices: 'new notifications',
    view_all_activities: 'View all activities',
    // Settings tabs
    tab_profile: 'Personal Profile',
    tab_security: 'Security & 2FA',
    tab_notifications: 'Notifications',
    tab_appearance: 'Appearance',
    tab_language: 'Language',
    // Language settings page
    choose_language: 'Display Language Options',
    choose_language_desc: 'Select your preferred language interface for the Finora platform.',
    vietnamese: 'Tiếng Việt (Vietnamese)',
    vietnamese_desc: 'Vietnamese interface tailored for Vietnam stock markets (Default).',
    english: 'English',
    english_desc: 'English interface for international investors and global trading terms.',
    save_changes: 'Save Changes',
    cancel_changes: 'Cancel Changes',
    lang_changed_toast: 'Display language changed to',
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('finora_lang')
    return (saved === 'en' || saved === 'vi') ? saved : 'vi'
  })

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('finora_lang', lang)
  }

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['vi'][key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

