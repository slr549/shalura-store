/*import { api } from '../utils/api.js'
import { storage } from '../utils/storage.js'

class ProductStore {
  constructor() {
    this.products = []
    this.categories = []
    this.filters = {
      category: 'all',
      minPrice: null,
      maxPrice: null,
      sort: 'newest',
      search: ''
    }
    this.loading = false
    this.listeners = []
  }

  // Fetch all products
  async fetchProducts() {
    this.loading = true
    this.notify()
    
    try {
      this.products = await api.getProducts()
      this.extractCategories()
      this.loading = false
      this.notify()
      return this.products
    } catch (error) {
      console.error('Error fetching products:', error)
      this.loading = false
      
      // Fallback to mock data
      this.products = this.getMockProducts()
      this.extractCategories()
      this.notify()
      return this.products
    }
  }

  // Fetch featured products
  async fetchFeaturedProducts() {
    try {
      return await api.getFeaturedProducts()
    } catch (error) {
      return this.products.filter(p => p.featured).slice(0, 8)
    }
  }

  // Extract unique categories
  extractCategories() {
    const categories = ['all', ...new Set(this.products.map(p => p.category))]
    this.categories = categories
  }

  // Apply filters
  applyFilters(filters = {}) {
    this.filters = { ...this.filters, ...filters }
    this.notify()
    return this.getFilteredProducts()
  }

  // Get filtered products
  getFilteredProducts() {
    let filtered = [...this.products]

    // Search filter
    if (this.filters.search) {
      const searchLower = this.filters.search.toLowerCase()
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.brand?.toLowerCase().includes(searchLower)
      )
    }

    // Category filter
    if (this.filters.category && this.filters.category !== 'all') {
      filtered = filtered.filter(p => p.category === this.filters.category)
    }

    // Price filter
    if (this.filters.minPrice) {
      filtered = filtered.filter(p => p.finalPrice >= this.filters.minPrice)
    }
    if (this.filters.maxPrice) {
      filtered = filtered.filter(p => p.finalPrice <= this.filters.maxPrice)
    }

    // Sort
    switch (this.filters.sort) {
      case 'price-asc':
        filtered.sort((a, b) => a.finalPrice - b.finalPrice)
        break
      case 'price-desc':
        filtered.sort((a, b) => b.finalPrice - a.finalPrice)
        break
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      default: // newest
        filtered.sort((a, b) => b.id - a.id)
    }

    return filtered
  }

  // Get product by ID
  getProductById(id) {
    return this.products.find(p => p.id == id)
  }

  // Mock data fallback
  getMockProducts() {
    return [
      {
        id: 1,
        name: "Kemeja Flanel Premium",
        price: 299000,
        discount: 20,
        finalPrice: 239200,
        stock: 25,
        description: "Kemeja flanel premium dengan bahan katun terbaik, nyaman dipakai sehari-hari.",
        category: "Pria",
        brand: "Premium Brand",
        tags: ["bestseller", "new"],
        variants: [
          { id: 1, color: "Biru Navy", size: "M", sku: "KFL-001-M-BL", stock: 10 },
          { id: 2, color: "Hijau Army", size: "L", sku: "KFL-001-L-GR", stock: 15 }
        ],
        images: [
          "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&h=800&fit=crop",
          "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=800&fit=crop"
        ],
        featured: true,
        rating: 4.5,
        reviewCount: 128,
        createdAt: "2024-01-15"
      },
      // Add more mock products as needed
    ]
  }

  // Subscribe to changes
  subscribe(listener) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  // Notify listeners
  notify() {
    this.listeners.forEach(listener => listener(this))
  }
}

// Singleton instance
export const productStore = new ProductStore()*/

import { api } from '../utils/api.js'
import { storage } from '../utils/storage.js'

class ProductStore {
  constructor() {
    this.products = []
    this.categories = []
    this.filters = {
      category: 'all',
      minPrice: null,
      maxPrice: null,
      sort: 'newest',
      search: ''
    }
    this.loading = false
    this.listeners = []
  }

  // Fetch all products
  async fetchProducts() {
    this.loading = true
    this.notify()
    
    try {
      this.products = await api.getProducts()
      this.extractCategories()
      this.loading = false
      this.notify()
      return this.products
    } catch (error) {
      console.error('Error fetching products:', error)
      this.loading = false
      
      // Fallback to mock data
      this.products = this.getMockProducts()
      this.extractCategories()
      this.notify()
      return this.products
    }
  }

  // Fetch featured products
  async fetchFeaturedProducts() {
    try {
      return await api.getFeaturedProducts()
    } catch (error) {
      return this.products.filter(p => p.featured).slice(0, 8)
    }
  }

  // Extract unique categories
  extractCategories() {
    const categories = ['all', ...new Set(this.products.map(p => p.category))]
    this.categories = categories
  }

  // Apply filters
  applyFilters(filters = {}) {
    this.filters = { ...this.filters, ...filters }
    this.notify()
    return this.getFilteredProducts()
  }

  // Get filtered products
  getFilteredProducts() {
    let filtered = [...this.products]

    // Search filter
    if (this.filters.search) {
      const searchLower = this.filters.search.toLowerCase()
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.brand?.toLowerCase().includes(searchLower)
      )
    }

    // Category filter
    if (this.filters.category && this.filters.category !== 'all') {
      filtered = filtered.filter(p => p.category === this.filters.category)
    }

    // Price filter
    if (this.filters.minPrice) {
      filtered = filtered.filter(p => p.finalPrice >= this.filters.minPrice)
    }
    if (this.filters.maxPrice) {
      filtered = filtered.filter(p => p.finalPrice <= this.filters.maxPrice)
    }

    // Sort
    switch (this.filters.sort) {
      case 'price-asc':
        filtered.sort((a, b) => a.finalPrice - b.finalPrice)
        break
      case 'price-desc':
        filtered.sort((a, b) => b.finalPrice - a.finalPrice)
        break
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      default: // newest
        filtered.sort((a, b) => b.id - a.id)
    }

    return filtered
  }

  // Get product by ID
  getProductById(id) {
    return this.products.find(p => p.id == id)
  }

  // Mock data fallback
  getMockProducts() {
    return [
      {
        id: 1,
        name: "Kemeja Flanel Premium",
        price: 299000,
        discount: 20,
        finalPrice: 239200,
        stock: 25,
        description: "Kemeja flanel premium dengan bahan katun terbaik, nyaman dipakai sehari-hari.",
        category: "Pria",
        brand: "Premium Brand",
        tags: ["bestseller", "new"],
        variants: [
          { id: 1, color: "Biru Navy", size: "M", sku: "KFL-001-M-BL", stock: 10 },
          { id: 2, color: "Hijau Army", size: "L", sku: "KFL-001-L-GR", stock: 15 }
        ],
        images: [
          "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&h=800&fit=crop",
          "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=800&fit=crop"
        ],
        featured: true,
        rating: 4.5,
        reviewCount: 128,
        createdAt: "2024-01-15"
      },
      // Add more mock products as needed
    ]
  }

  // Subscribe to changes
  subscribe(listener) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  // Notify listeners
  notify() {
    this.listeners.forEach(listener => listener(this))
  }
}

// Singleton instance
export const productStore = new ProductStore()