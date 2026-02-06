const API_BASE = 'http://localhost:3001/api'

export class ApiClient {
  constructor() {
    this.baseUrl = API_BASE
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, { ...defaultOptions, ...options })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('API Request failed:', error)
      throw error
    }
  }

  // Products
  getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return this.request(`/products${queryString ? '?' + queryString : ''}`)
  }

  getProduct(id) {
    return this.request(`/products/${id}`)
  }

  getFeaturedProducts() {
    return this.request('/products/featured')
  }

  searchProducts(filters = {}) {
    const queryString = new URLSearchParams(filters).toString()
    return this.request(`/products/search${queryString ? '?' + queryString : ''}`)
  }

  // Categories
  getCategories() {
    return this.request('/categories')
  }

  // Auth
  login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  // Cart
  getCart(userId) {
    return this.request(`/carts?userId=${userId}`)
  }

  addToCart(data) {
    return this.request('/carts', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Orders
  createOrder(data) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  getOrders(userId) {
    return this.request(`/orders?userId=${userId}`)
  }
}

export const api = new ApiClient()