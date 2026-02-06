// src/utils/api.js - Updated for real backend
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export class ApiClient {
  constructor() {
    this.baseUrl = API_BASE
    this.token = localStorage.getItem('token')
  }

  setToken(token) {
    this.token = token
    localStorage.setItem('token', token)
  }

  removeToken() {
    this.token = null
    localStorage.removeItem('token')
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    }
    
    if (this.token) {
      defaultHeaders['Authorization'] = `Bearer ${this.token}`
    }

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, config)
      
      // Handle 204 No Content
      if (response.status === 204) {
        return null
      }

      const data = await response.json()

      if (!response.ok) {
        throw new ApiError(
          data.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status
        )
      }

      return data
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      
      // Network error or JSON parsing error
      console.error('API Request failed:', error)
      throw new ApiError(
        'Network error. Please check your connection.',
        0
      )
    }
  }

  // Auth endpoints
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
    
    if (response.success && response.token) {
      this.setToken(response.token)
    }
    
    return response
  }

  async logout() {
    const response = await this.request('/auth/logout', {
      method: 'GET',
    })
    
    this.removeToken()
    return response
  }

  async getProfile() {
    return this.request('/auth/me')
  }

  async updateProfile(userData) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    })
  }

  // Product endpoints
  async getProducts(filters = {}) {
    const queryString = new URLSearchParams(filters).toString()
    return this.request(`/products${queryString ? '?' + queryString : ''}`)
  }

  async getProduct(id) {
    return this.request(`/products/${id}`)
  }

  async getFeaturedProducts() {
    return this.request('/products/featured')
  }

  async getCategories() {
    return this.request('/products/categories')
  }

  async getBrands() {
    return this.request('/products/brands')
  }

  // Cart endpoints
  async getCart() {
    return this.request('/cart')
  }

  async addToCart(itemData) {
    return this.request('/cart/items', {
      method: 'POST',
      body: JSON.stringify(itemData),
    })
  }

  async updateCartItem(itemId, quantity) {
    return this.request(`/cart/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    })
  }

  async removeCartItem(itemId) {
    return this.request(`/cart/items/${itemId}`, {
      method: 'DELETE',
    })
  }

  async clearCart() {
    return this.request('/cart/clear', {
      method: 'DELETE',
    })
  }

  // Wishlist endpoints
  async getWishlist() {
    return this.request('/wishlist')
  }

  async addToWishlist(productId) {
    return this.request('/wishlist', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    })
  }

  async removeFromWishlist(productId) {
    return this.request(`/wishlist/${productId}`, {
      method: 'DELETE',
    })
  }

  // Order endpoints
  async createOrder(orderData) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    })
  }

  async getOrders(filters = {}) {
    const queryString = new URLSearchParams(filters).toString()
    return this.request(`/orders${queryString ? '?' + queryString : ''}`)
  }

  async getOrder(orderId) {
    return this.request(`/orders/${orderId}`)
  }

  async cancelOrder(orderId) {
    return this.request(`/orders/${orderId}/cancel`, {
      method: 'PUT',
    })
  }

  // Review endpoints
  async getProductReviews(productId, filters = {}) {
    const queryString = new URLSearchParams({ productId, ...filters }).toString()
    return this.request(`/reviews${queryString ? '?' + queryString : ''}`)
  }

  async createReview(reviewData) {
    return this.request('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    })
  }

  async likeReview(reviewId) {
    return this.request(`/reviews/${reviewId}/like`, {
      method: 'POST',
    })
  }

  // Address endpoints
  async getAddresses() {
    return this.request('/addresses')
  }

  async createAddress(addressData) {
    return this.request('/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData),
    })
  }

  async updateAddress(addressId, addressData) {
    return this.request(`/addresses/${addressId}`, {
      method: 'PUT',
      body: JSON.stringify(addressData),
    })
  }

  async deleteAddress(addressId) {
    return this.request(`/addresses/${addressId}`, {
      method: 'DELETE',
    })
  }

  async setDefaultAddress(addressId) {
    return this.request(`/addresses/${addressId}/default`, {
      method: 'PUT',
    })
  }

  // Admin endpoints
  async adminGetStats() {
    return this.request('/admin/stats')
  }

  async adminGetOrders(filters = {}) {
    const queryString = new URLSearchParams(filters).toString()
    return this.request(`/admin/orders${queryString ? '?' + queryString : ''}`)
  }

  async adminUpdateOrder(orderId, updates) {
    return this.request(`/admin/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  async adminCreateProduct(productData) {
    return this.request('/admin/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    })
  }

  async adminUpdateProduct(productId, productData) {
    return this.request(`/admin/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    })
  }

  async adminDeleteProduct(productId) {
    return this.request(`/admin/products/${productId}`, {
      method: 'DELETE',
    })
  }
}

// Singleton instance
export const api = new ApiClient()