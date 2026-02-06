/*import { cartStore } from '../stores/cartStore.js'
import { formatters } from '../utils/formatters.js'

export class ProductCard {
  constructor(product) {
    this.product = product
  }

  render() {
    const discount = this.product.discount > 0
      ? Math.round(((this.product.price - this.product.finalPrice) / this.product.price) * 100)
      : 0

    return `
      <div class="product-card group animate-fade-in">
        <!-- Product Image -->
        <div class="relative overflow-hidden">
          <a href="#/product/${this.product.id}">
            <img 
              src="${this.product.images[0]}" 
              alt="${this.product.name}"
              class="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            >
          </a>
          
          <!-- Discount Badge -->
          ${discount > 0 ? `
            <div class="absolute top-3 left-3">
              <span class="badge-error">
                -${discount}%
              </span>
            </div>
          ` : ''}
          
          <!-- Featured Badge -->
          ${this.product.featured ? `
            <div class="absolute top-3 right-3">
              <span class="badge-primary">
                <i class="fas fa-star mr-1"></i> Unggulan
              </span>
            </div>
          ` : ''}
          
          <!-- Quick Actions -->
          <div class="absolute bottom-0 left-0 right-0 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <div class="flex bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-2 justify-between">
              <button 
                class="btn-ghost text-sm flex-1"
                onclick="location.hash='#/product/${this.product.id}'"
              >
                <i class="fas fa-eye mr-2"></i> Detail
              </button>
              <button 
                class="btn-primary text-sm flex-1 ml-2 add-to-cart-btn"
                data-product-id="${this.product.id}"
              >
                <i class="fas fa-cart-plus mr-2"></i> Beli
              </button>
            </div>
          </div>
        </div>

        <!-- Product Info -->
        <div class="p-4">
          <!-- Category -->
          <div class="mb-2">
            <span class="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
              ${this.product.category}
            </span>
            ${this.product.brand ? `
              <span class="text-xs text-gray-500 dark:text-gray-400 ml-2">
                • ${this.product.brand}
              </span>
            ` : ''}
          </div>

          <!-- Product Name -->
          <a href="#/product/${this.product.id}" class="block mb-2">
            <h3 class="font-semibold text-lg truncate hover:text-primary-600 transition-colors">
              ${this.product.name}
            </h3>
          </a>

          <!-- Rating -->
          <div class="flex items-center mb-3">
            <div class="flex items-center">
              ${this.renderStars(this.product.rating)}
            </div>
            <span class="text-sm text-gray-500 dark:text-gray-400 ml-2">
              (${this.product.reviewCount || 0})
            </span>
          </div>

          <!-- Price -->
          <div class="flex items-center justify-between">
            <div>
              ${discount > 0 ? `
                <div class="text-sm text-gray-500 line-through">
                  ${formatters.currency(this.product.price)}
                </div>
              ` : ''}
              <div class="font-bold text-xl text-primary-600">
                ${formatters.currency(this.product.finalPrice)}
              </div>
            </div>
            
            <!-- Stock Indicator -->
            <div class="text-sm ${this.product.stock > 10 ? 'text-green-600' : this.product.stock > 0 ? 'text-yellow-600' : 'text-red-600'}">
              ${this.product.stock > 10 ? 'Stok Tersedia' : this.product.stock > 0 ? 'Stok Terbatas' : 'Stok Habis'}
            </div>
          </div>
        </div>
      </div>
    `
  }

  renderStars(rating) {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    const stars = []
    
    for (let i = 0; i < fullStars; i++) {
      stars.push('<i class="fas fa-star text-yellow-400"></i>')
    }
    
    if (hasHalfStar) {
      stars.push('<i class="fas fa-star-half-alt text-yellow-400"></i>')
    }
    
    const emptyStars = 5 - stars.length
    for (let i = 0; i < emptyStars; i++) {
      stars.push('<i class="far fa-star text-yellow-400"></i>')
    }
    
    return stars.join('')
  }

  attachEvents(element) {
    const addToCartBtn = element.querySelector('.add-to-cart-btn')
    if (addToCartBtn) {
      addToCartBtn.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()
        this.addToCart()
      })
    }
  }

  addToCart() {
    cartStore.addItem(this.product)
    
    // Show notification
    this.showNotification('Produk ditambahkan ke keranjang!', 'success')
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div')
    notification.className = `
      fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg 
      animate-slide-up ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white
      flex items-center
    `
    notification.innerHTML = `
      <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} mr-2"></i>
      <span>${message}</span>
    `
    
    document.body.appendChild(notification)
    
    setTimeout(() => {
      notification.classList.add('opacity-0', 'transition-opacity', 'duration-300')
      setTimeout(() => notification.remove(), 300)
    }, 2000)
  }
} */

import { cartStore } from '../stores/cartStore.js'
import { wishlistStore } from '../stores/wishlistStore.js' // Import baru
import { formatters } from '../utils/formatters.js'

export class ProductCard {
  constructor(product) {
    this.product = product
    // Cek status awal wishlist saat inisialisasi
    this.isInWishlist = wishlistStore ? wishlistStore.isInWishlist(product.id) : false
  }

  render() {
    const discount = this.product.discount > 0
      ? Math.round(((this.product.price - this.product.finalPrice) / this.product.price) * 100)
      : 0

    return `
      <div class="product-card group animate-fade-in relative">
        <div class="relative overflow-hidden">
          <a href="#/product/${this.product.id}">
            <img 
              src="${this.product.images[0]}" 
              alt="${this.product.name}"
              class="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            >
          </a>
          
          ${discount > 0 ? `
            <div class="absolute top-3 left-3 z-10">
              <span class="badge-error">
                -${discount}%
              </span>
            </div>
          ` : ''}
          
          ${this.product.featured ? `
            <div class="absolute top-3 right-12 z-10">
              <span class="badge-primary">
                <i class="fas fa-star mr-1"></i> Unggulan
              </span>
            </div>
          ` : ''}

          <button 
            class="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm flex items-center justify-center hover:bg-white dark:hover:bg-gray-900 transition-colors shadow-sm wishlist-btn z-20"
            data-product-id="${this.product.id}"
            title="${this.isInWishlist ? 'Hapus dari Wishlist' : 'Tambah ke Wishlist'}"
          >
            <i class="${this.isInWishlist ? 'fas fa-heart text-red-500' : 'far fa-heart text-gray-400'}"></i>
          </button>
          
          <div class="absolute bottom-0 left-0 right-0 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10">
            <div class="flex bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-2 justify-between">
              <button 
                class="btn-ghost text-sm flex-1"
                onclick="location.hash='#/product/${this.product.id}'"
              >
                <i class="fas fa-eye mr-2"></i> Detail
              </button>
              <button 
                class="btn-primary text-sm flex-1 ml-2 add-to-cart-btn"
                data-product-id="${this.product.id}"
              >
                <i class="fas fa-cart-plus mr-2"></i> Beli
              </button>
            </div>
          </div>
        </div>

        <div class="p-4">
          <div class="mb-2">
            <span class="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
              ${this.product.category}
            </span>
            ${this.product.brand ? `
              <span class="text-xs text-gray-500 dark:text-gray-400 ml-2">
                • ${this.product.brand}
              </span>
            ` : ''}
          </div>

          <a href="#/product/${this.product.id}" class="block mb-2">
            <h3 class="font-semibold text-lg truncate hover:text-primary-600 transition-colors">
              ${this.product.name}
            </h3>
          </a>

          <div class="flex items-center mb-3">
            <div class="flex items-center">
              ${this.renderStars(this.product.rating)}
            </div>
            <span class="text-sm text-gray-500 dark:text-gray-400 ml-2">
              (${this.product.reviewCount || 0})
            </span>
          </div>

          <div class="flex items-center justify-between">
            <div>
              ${discount > 0 ? `
                <div class="text-sm text-gray-500 line-through">
                  ${formatters.currency(this.product.price)}
                </div>
              ` : ''}
              <div class="font-bold text-xl text-primary-600">
                ${formatters.currency(this.product.finalPrice)}
              </div>
            </div>
            
            <div class="text-sm ${this.product.stock > 10 ? 'text-green-600' : this.product.stock > 0 ? 'text-yellow-600' : 'text-red-600'}">
              ${this.product.stock > 10 ? 'Stok Tersedia' : this.product.stock > 0 ? 'Stok Terbatas' : 'Stok Habis'}
            </div>
          </div>
        </div>
      </div>
    `
  }

  renderStars(rating) {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    const stars = []
    
    for (let i = 0; i < fullStars; i++) {
      stars.push('<i class="fas fa-star text-yellow-400"></i>')
    }
    
    if (hasHalfStar) {
      stars.push('<i class="fas fa-star-half-alt text-yellow-400"></i>')
    }
    
    const emptyStars = 5 - stars.length
    for (let i = 0; i < emptyStars; i++) {
      stars.push('<i class="far fa-star text-yellow-400"></i>')
    }
    
    return stars.join('')
  }

  attachEvents(element) {
    // 1. Add to Cart Button
    const addToCartBtn = element.querySelector('.add-to-cart-btn')
    if (addToCartBtn) {
      addToCartBtn.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()
        this.addToCart()
      })
    }

    // 2. Wishlist Button (NEW)
    const wishlistBtn = element.querySelector('.wishlist-btn')
    if (wishlistBtn) {
      wishlistBtn.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()
        this.toggleWishlist()
      })
    }
  }

  addToCart() {
    cartStore.addItem(this.product)
    this.showNotification('Produk ditambahkan ke keranjang!', 'success')
  }

  toggleWishlist() {
    if (!wishlistStore) return
    
    const added = wishlistStore.toggleItem(this.product)
    this.isInWishlist = !this.isInWishlist
    
    this.showNotification(
      added ? 'Ditambahkan ke wishlist!' : 'Dihapus dari wishlist',
      added ? 'success' : 'info'
    )
    
    // Update button icon secara langsung tanpa re-render seluruh card
    // Kita cari button yang spesifik milik card ini menggunakan ID produk
    // Catatan: Jika ada banyak card dengan ID sama di halaman (jarang terjadi), ini akan update semua.
    const buttons = document.querySelectorAll(`.wishlist-btn[data-product-id="${this.product.id}"]`)
    buttons.forEach(btn => {
        const icon = btn.querySelector('i')
        if (icon) {
            // Update class icon (Solid vs Regular heart)
            icon.className = added ? 'fas fa-heart text-red-500' : 'far fa-heart text-gray-400'
        }
        // Update tooltip
        btn.title = added ? 'Hapus dari Wishlist' : 'Tambah ke Wishlist'
        
        // Efek animasi kecil saat klik
        btn.classList.add('scale-125')
        setTimeout(() => btn.classList.remove('scale-125'), 200)
    })
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div')
    notification.className = `
      fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg 
      animate-slide-up ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white
      flex items-center
    `
    notification.innerHTML = `
      <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} mr-2"></i>
      <span>${message}</span>
    `
    
    document.body.appendChild(notification)
    
    setTimeout(() => {
      notification.classList.add('opacity-0', 'transition-opacity', 'duration-300')
      setTimeout(() => notification.remove(), 300)
    }, 2000)
  }
}