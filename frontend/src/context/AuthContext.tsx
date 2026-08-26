import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api } from '../lib/api'
import type { User, UserRole } from '../types'

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<User>
  loginWithOtp: (phone: string, code: string) => Promise<User>
  register: (
    name: string,
    email: string,
    phone: string,
    password: string,
    passwordConfirmation: string,
    role: UserRole,
    referralCode?: string,
  ) => Promise<User>
  logout: () => Promise<void>
  setUser: (user: User) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }

    api
      .get<User>('/me')
      .then((res) => setUser(res.data))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false))
  }, [])

  async function login(email: string, password: string) {
    const res = await api.post<{ user: User; token: string }>('/login', { email, password })
    localStorage.setItem('token', res.data.token)
    setUser(res.data.user)
    return res.data.user
  }

  async function loginWithOtp(phone: string, code: string) {
    const res = await api.post<{ user: User; token: string }>('/login/otp/verify', { phone, code })
    localStorage.setItem('token', res.data.token)
    setUser(res.data.user)
    return res.data.user
  }

  async function register(
    name: string,
    email: string,
    phone: string,
    password: string,
    passwordConfirmation: string,
    role: UserRole,
    referralCode?: string,
  ) {
    const res = await api.post<{ user: User; token: string }>('/register', {
      name,
      email,
      phone: phone || null,
      password,
      password_confirmation: passwordConfirmation,
      role,
      referral_code: referralCode || null,
    })
    localStorage.setItem('token', res.data.token)
    setUser(res.data.user)
    return res.data.user
  }

  async function logout() {
    try {
      await api.post('/logout')
    } finally {
      localStorage.removeItem('token')
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithOtp, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
