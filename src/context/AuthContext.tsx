import React, { createContext, useContext, useState, useEffect } from 'react'
import { authApi, setToken } from '../services/api.js'
import type { User } from '../types/index.js'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<User>
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<User>
  loginWithGoogle: (data: {
    idToken?: string
    email: string
    name?: string
    picture?: string
    googleId?: string
  }) => Promise<User>
  logout: () => void
  updateProfile: (data: { name?: string; phone?: string; settings?: Record<string, unknown> }) => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = async () => {
    try {
      const res = await authApi.getMe()
      setUser(res.user)
    } catch {
      setUser(null)
      setToken(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('finora_token')
    if (token) {
      refreshUser()
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string): Promise<User> => {
    const res = await authApi.login({ email, password })
    setToken(res.accessToken)
    setUser(res.user)
    return res.user
  }

  const register = async (data: {
    name: string
    email: string
    password: string
    phone?: string
  }): Promise<User> => {
    const res = await authApi.register(data)
    setToken(res.accessToken)
    setUser(res.user)
    return res.user
  }

  const loginWithGoogle = async (data: {
    idToken?: string
    email: string
    name?: string
    picture?: string
    googleId?: string
  }): Promise<User> => {
    const res = await authApi.googleLogin(data)
    setToken(res.accessToken)
    setUser(res.user)
    return res.user
  }

  const logout = () => {
    setToken(null)
    setUser(null)
  }

  const updateProfile = async (data: {
    name?: string
    phone?: string
    settings?: Record<string, unknown>
  }) => {
    const res = await authApi.updateProfile(data)
    setUser(res.user)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        loginWithGoogle,
        logout,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

