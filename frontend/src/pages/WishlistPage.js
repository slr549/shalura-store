import { wishlistStore } from '../stores/wishlistStore.js'
import { cartStore } from '../stores/cartStore.js'
import { productStore } from '../stores/productStore.js'
import { formatters } from '../utils/formatters.js'

export class WishlistPage {
  constructor() {
    this.wishlist = wishlistStore.getWishlist()
    this.unsubscribe = null
    this.products = []
  }

  async render() {
    await this.loadProducts()
    
    this.unsubscribe = wishlistStore.subscribe(() => {
      this.wishlist = wishlistStore.getWishlist()
      this.loadProducts()
      this.updateView()
    })

    return `
      <div class="animate-fade-in">
        <!-- Page Header -->
        <div class="flex justify-between items-center mb-8">
          <div>
            <h1 class="text-3xl font-bold mb-2">Wishlist Saya</h1>
            <p class="text-gray-600 dark:text-gray-400">
              ${this.wishlist.items.length} item dalam wishlist
            </p>
          </div>
          
          ${this.wishlist.items.length > 0 ? `
            <button 
              class="btn-secondary"
              onclick="window.wishlistPage?.clearWishlist()"
            >
              <i class="fas fa-trash-alt mr-2"></i>Kosongkan Wishlist
            </button>
          ` : ''}
        </div>

        ${this.wishlist.items.length === 0 ? this.renderEmptyState() : this.renderWishlist()}
      </div>
    `
  }

  async loadProducts() {
    await productStore.fetchProducts()
    this.products = this.wishlist.items.map(wishlistItem => {
      const product = productStore.getProductById(wishlistItem.productId)
      return product ? { ...product, wishlistId: wishlistItem.id } : null
    }).filter(Boolean)
  }

  renderWishlist() {
    return `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        ${this.products.map(product => this.renderProductCard(product)).join('')}
      </div>
    `
  }

  renderProductCard(product) {
    const discount = product.discount > 0
      ? Math.round(((product.price - product.finalPrice) / product.price) * 100)
      : 0

    return `
      <div class="product-card group">
        <!-- Wishlist Button -->
        <button 
          class="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm flex items-center justify-center hover:bg-white dark:hover:bg-gray-900 transition-colors"
          onclick="window.wishlistPage?.removeFromWishlist(${product.id})"
          title="Hapus dari Wishlist"
        >
          <i class="fas fa-heart text-red-500"></i>
        </button>

        <!-- Product Image -->
        <div class="relative overflow-hidden">
          <a href="#/product/${product.id}">
            <img 
              src="${product.images[0]}" 
              alt="${product.name}"
              class="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
            >
          </a>
          
          ${discount > 0 ? `
            <div class="absolute top-3 left-3">
              <span class="badge-error">
                -${discount}%
              </span>
            </div>
          ` : ''}
        </div>

        <!-- Product Info -->
        <div class="p-4">
          <h3 class="font-semibold text-lg mb-2 truncate">
            <a href="#/product/${product.id}" class="hover:text-primary-600">
              ${product.name}
            </a>
          </h3>
          
          <div class="flex items-center mb-3">
            <div class="flex items-center">
              ${this.renderStars(product.rating)}
            </div>
            <span class="text-sm text-gray-500 ml-2">
              (${product.reviewCount || 0})
            </span>
          </div>

          <!-- Price -->
          <div class="mb-4">
            ${discount > 0 ? `
              <div class="text-sm text-gray-500 line-through">
                ${formatters.currency(product.price)}
              </div>
            ` : ''}
            <div class="font-bold text-xl text-primary-600">
              ${formatters.currency(product.finalPrice)}
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex space-x-2">
            <button 
              class="btn-primary flex-1 text-sm py-2"
              onclick="window.wishlistPage?.addToCartFromWishlist(${product.id})"
            >
              <i class="fas fa-cart-plus mr-2"></i>Beli
            </button>
            <button 
              class="btn-secondary text-sm py-2 px-3"
              onclick="window.wishlistPage?.removeFromWishlist(${product.id})"
            >
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `
  }

  renderStars(rating) {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    let stars = ''
    
    for (let i = 0; i < fullStars; i++) {
      stars += '<i class="fas fa-star text-yellow-400"></i>'
    }
    
    if (hasHalfStar) {
      stars += '<i class="fas fa-star-half-alt text-yellow-400"></i>'
    }
    
    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars += '<i class="far fa-star text-yellow-400"></i>'
    }
    
    return stars
  }

  renderEmptyState() {
    return `
      <div class="text-center py-20">
        <div class="w-32 h-32 mx-auto mb-6 text-gray-300">
          <i class="fas fa-heart text-9xl"></i>
        </div>
        <h3 class="text-2xl font-bold mb-4">Wishlist Kosong</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
          Tambahkan produk favorit Anda ke wishlist untuk menyimpannya dan membelinya nanti.
        </p>
        <a href="#/products" class="btn-primary inline-block px-8 py-3">
          <i class="fas fa-store mr-2"></i>Jelajahi Produk
        </a>
      </div>
    `
  }

  // Public methods for template
  removeFromWishlist(productId) {
    wishlistStore.removeItem(productId)
    this.showNotification('Dihapus dari wishlist', 'info')
  }

  addToCartFromWishlist(productId) {
    const product = productStore.getProductById(productId)
    if (product) {
      cartStore.addItem(product)
      this.showNotification('Ditambahkan ke keranjang!', 'success')
    }
  }

  clearWishlist() {
    if (confirm('Kosongkan seluruh wishlist?')) {
      wishlistStore.clearWishlist()
      this.showNotification('Wishlist dikosongkan', 'info')
    }
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div')
    notification.className = `
      fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg 
      animate-slide-up ${type === 'success' ? 'bg-green-500' : 'bg-blue-500'} text-white
      flex items-center
    `
    notification.innerHTML = `
      <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'} mr-2"></i>
      <span>${message}</span>
    `
    
    document.body.appendChild(notification)
    
    setTimeout(() => {
      notification.classList.add('opacity-0', 'transition-opacity', 'duration-300')
      setTimeout(() => notification.remove(), 300)
    }, 2000)
  }

  updateView() {
    const mainContent = document.getElementById('main-content')
    if (mainContent) {
      mainContent.innerHTML = this.render()
      this.attachEvents()
    }
  }

  attachEvents() {
    window.wishlistPage = this
  }

  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe()
    }
    delete window.wishlistPage
  }
}