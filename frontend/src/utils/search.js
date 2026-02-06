import { productStore } from '../stores/productStore.js'

export class ProductSearch {
  constructor() {
    this.filters = {
      category: 'all',
      minPrice: null,
      maxPrice: null,
      rating: null,
      inStock: false,
      onSale: false,
      featured: false,
      brands: [],
      colors: [],
      sizes: [],
      sort: 'newest',
      page: 1,
      limit: 12
    }
  }

  // Search products with advanced filters
  search(query = '') {
    let products = [...productStore.products]

    // Text search
    if (query) {
      const searchLower = query.toLowerCase()
      products = products.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.brand?.toLowerCase().includes(searchLower) ||
        p.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    // Apply filters
    products = this.applyFilters(products)

    // Apply sorting
    products = this.applySorting(products)

    // Apply pagination
    const total = products.length
    const startIndex = (this.filters.page - 1) * this.filters.limit
    const endIndex = startIndex + this.filters.limit
    products = products.slice(startIndex, endIndex)

    return {
      products,
      total,
      page: this.filters.page,
      totalPages: Math.ceil(total / this.filters.limit),
      hasMore: endIndex < total
    }
  }

  applyFilters(products) {
    let filtered = [...products]

    // Category filter
    if (this.filters.category && this.filters.category !== 'all') {
      filtered = filtered.filter(p => p.category === this.filters.category)
    }

    // Price range
    if (this.filters.minPrice !== null) {
      filtered = filtered.filter(p => p.finalPrice >= this.filters.minPrice)
    }
    if (this.filters.maxPrice !== null) {
      filtered = filtered.filter(p => p.finalPrice <= this.filters.maxPrice)
    }

    // Rating
    if (this.filters.rating !== null) {
      filtered = filtered.filter(p => p.rating >= this.filters.rating)
    }

    // In stock
    if (this.filters.inStock) {
      filtered = filtered.filter(p => p.stock > 0)
    }

    // On sale
    if (this.filters.onSale) {
      filtered = filtered.filter(p => p.discount > 0)
    }

    // Featured
    if (this.filters.featured) {
      filtered = filtered.filter(p => p.featured)
    }

    // Brands
    if (this.filters.brands.length > 0) {
      filtered = filtered.filter(p => this.filters.brands.includes(p.brand))
    }

    // Colors (from variants)
    if (this.filters.colors.length > 0) {
      filtered = filtered.filter(p => 
        p.variants?.some(v => this.filters.colors.includes(v.color))
      )
    }

    // Sizes (from variants)
    if (this.filters.sizes.length > 0) {
      filtered = filtered.filter(p => 
        p.variants?.some(v => this.filters.sizes.includes(v.size))
      )
    }

    return filtered
  }

  applySorting(products) {
    const sorted = [...products]

    switch (this.filters.sort) {
      case 'price-asc':
        sorted.sort((a, b) => a.finalPrice - b.finalPrice)
        break
      case 'price-desc':
        sorted.sort((a, b) => b.finalPrice - a.finalPrice)
        break
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating)
        break
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'popular':
        sorted.sort((a, b) => b.reviewCount - a.reviewCount)
        break
      case 'newest':
      default:
        sorted.sort((a, b) => b.id - a.id)
    }

    return sorted
  }

  // Get available filter options
  getFilterOptions() {
    const products = productStore.products
    
    const brands = [...new Set(products.map(p => p.brand).filter(Boolean))]
    const categories = ['all', ...new Set(products.map(p => p.category))]
    
    // Extract colors from variants
    const colors = []
    products.forEach(p => {
      p.variants?.forEach(v => {
        if (v.color && !colors.includes(v.color)) {
          colors.push(v.color)
        }
      })
    })
    
    // Extract sizes from variants
    const sizes = []
    products.forEach(p => {
      p.variants?.forEach(v => {
        if (v.size && !sizes.includes(v.size)) {
          sizes.push(v.size)
        }
      })
    })
    
    // Price range
    const prices = products.map(p => p.finalPrice)
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const priceRange = {
      min: Math.floor(minPrice / 1000) * 1000,
      max: Math.ceil(maxPrice / 1000) * 1000
    }
    
    return {
      brands,
      categories,
      colors,
      sizes,
      priceRange
    }
  }

  // Update filters
  updateFilters(newFilters) {
    this.filters = { ...this.filters, ...newFilters }
  }

  // Reset filters
  resetFilters() {
    this.filters = {
      category: 'all',
      minPrice: null,
      maxPrice: null,
      rating: null,
      inStock: false,
      onSale: false,
      featured: false,
      brands: [],
      colors: [],
      sizes: [],
      sort: 'newest',
      page: 1,
      limit: 12
    }
  }
}

// Singleton instance
export const productSearch = new ProductSearch()