import type {
  ApiResponse,
  User,
  Stock,
  Order,
  PortfolioData,
  MarketIndex,
} from '../types/index.js'

const API_BASE_URL = 'http://localhost:5000/api'

function getToken(): string | null {
  return localStorage.getItem('finora_token')
}

export function setToken(token: string | null): void {
  if (token) {
    localStorage.setItem('finora_token', token)
  } else {
    localStorage.removeItem('finora_token')
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  const json: ApiResponse<T> = await response.json()

  if (!response.ok || !json.success) {
    throw new Error(json.message || 'Đã có lỗi xảy ra.')
  }

  return json.data as T
}

// 1. Auth API
export const authApi = {
  login: (data: { email: string; password: string }) =>
    request<{ user: User; accessToken: string; refreshToken: string }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify(data) },
    ),

  register: (data: { name: string; email: string; password: string; phone?: string }) =>
    request<{ user: User; accessToken: string; refreshToken: string }>(
      '/auth/register',
      { method: 'POST', body: JSON.stringify(data) },
    ),

  googleLogin: (data: {
    idToken?: string
    email: string
    name?: string
    picture?: string
    googleId?: string
  }) =>
    request<{ user: User; accessToken: string; refreshToken: string }>(
      '/auth/google',
      { method: 'POST', body: JSON.stringify(data) },
    ),

  getMe: () => request<{ user: User }>('/auth/me'),

  updateProfile: (data: { name?: string; phone?: string; settings?: Record<string, unknown> }) =>
    request<{ user: User }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    request<{ accessToken: string; refreshToken: string }>(
      '/auth/change-password',
      { method: 'PUT', body: JSON.stringify(data) },
    ),
}

// 2. Stock API
export const stockApi = {
  getStocks: (search?: string) =>
    request<Stock[]>(`/stocks${search ? `?search=${encodeURIComponent(search)}` : ''}`),

  getStock: (symbol: string) => request<Stock>(`/stocks/${symbol}`),

  getMarketIndices: () => request<MarketIndex[]>('/stocks/market/indices'),
}

// 3. Portfolio API
export const portfolioApi = {
  getPortfolio: () => request<PortfolioData>('/portfolio'),
}

// 4. Order API
export const orderApi = {
  getOrders: (status?: string) =>
    request<Order[]>(`/orders${status && status !== 'Tất cả' ? `?status=${encodeURIComponent(status)}` : ''}`),

  placeOrder: (data: {
    symbol: string
    side: 'Mua' | 'Bán'
    orderType: string
    quantity: number
    price: number
  }) =>
    request<{ order: Order; cashBalance: number }>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  cancelOrder: (id: string) =>
    request<Order>(`/orders/${id}/cancel`, { method: 'PUT' }),
}

// 5. Watchlist API
export const watchlistApi = {
  getWatchlist: () =>
    request<{ symbols: string[]; stocks: Stock[] }>('/watchlist'),

  toggleWatchlist: (symbol: string) =>
    request<{ symbol: string; isFavorite: boolean; symbols: string[] }>(
      '/watchlist/toggle',
      { method: 'POST', body: JSON.stringify({ symbol }) },
    ),
}

// 6. Real-time Live Price Stream (SSE)
export function connectLiveStockStream(
  onUpdate: (data: {
    type: string
    isLiveMarket: boolean
    timestamp: string
    stocks: Array<Stock & { direction?: 'up' | 'down' | 'neutral' }>
    indices: MarketIndex[]
  }) => void,
): () => void {
  try {
    const eventSource = new EventSource(`${API_BASE_URL}/stocks/live/stream`)

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data)
        if (payload.type === 'TICK_UPDATE') {
          onUpdate(payload)
        }
      } catch (e) {
        console.error('Lỗi parse SSE:', e)
      }
    }

    eventSource.onerror = () => {
      // Tự động kết nối lại
    }

    return () => {
      eventSource.close()
    }
  } catch {
    return () => {}
  }
}