import { productStore } from '../stores/productStore.js'
import { cartStore } from '../stores/cartStore.js'
import { reviewStore } from '../stores/reviewStore.js' // Import baru
import { storage } from '../utils/storage.js' // Import baru
import { formatters } from '../utils/formatters.js'

export class ProductDetailPage {
  constructor(productId) {
    this.productId = productId
    this.product = null
    this.selectedVariant = null
    this.selectedImage = 0
    this.quantity = 1
  }

  async render() {
    await productStore.fetchProducts()
    this.product = productStore.getProductById(this.productId)
    
    if (!this.product) {
      return this.renderNotFound()
    }

    // Set default variant
    if (this.product.variants && this.product.variants.length > 0) {
      this.selectedVariant = this.product.variants[0]
    }

    const discount = this.product.discount > 0
      ? Math.round(((this.product.price - this.product.finalPrice) / this.product.price) * 100)
      : 0

    return `
      <div class="animate-fade-in">
        <nav class="mb-6 text-sm text-gray-600 dark:text-gray-400">
          <a href="#/" class="hover:text-primary-600">Home</a>
          <span class="mx-2">/</span>
          <a href="#/products" class="hover:text-primary-600">Produk</a>
          <span class="mx-2">/</span>
          <span class="text-gray-800 dark:text-gray-300">${this.product.name}</span>
        </nav>

        <div class="card overflow-hidden">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            <div>
              <div class="mb-4 rounded-xl overflow-hidden">
                <img 
                  src="${this.product.images[this.selectedImage]}" 
                  alt="${this.product.name}"
                  class="w-full h-96 object-cover cursor-zoom-in"
                  id="mainImage"
                >
              </div>

              ${this.product.images.length > 1 ? `
                <div class="flex space-x-3">
                  ${this.product.images.map((image, index) => `
                    <button 
                      class="w-20 h-20 rounded-lg overflow-hidden border-2 ${index === this.selectedImage ? 'border-primary-500' : 'border-transparent'}"
                      onclick="window.productDetail?.selectImage(${index})"
                    >
                      <img 
                        src="${image}" 
                        alt="Thumbnail ${index + 1}"
                        class="w-full h-full object-cover"
                      >
                    </button>
                  `).join('')}
                </div>
              ` : ''}
            </div>

            <div>
              <div class="mb-6">
                <div class="flex items-center justify-between mb-2">
                  <h1 class="text-3xl font-bold">${this.product.name}</h1>
                  ${this.product.featured ? `
                    <span class="badge-primary">
                      <i class="fas fa-star mr-1"></i> Unggulan
                    </span>
                  ` : ''}
                </div>
                
                <div class="flex items-center space-x-4 mb-4">
                  <div class="flex items-center">
                    ${this.renderStars(this.product.rating)}
                    <span class="ml-2 text-gray-600">
                      ${this.product.rating} (${this.product.reviewCount || 0} ulasan)
                    </span>
                  </div>
                  <span class="text-gray-400">•</span>
                  <span class="text-green-600">
                    <i class="fas fa-check-circle mr-1"></i>
                    ${this.product.stock > 0 ? 'Stok Tersedia' : 'Stok Habis'}
                  </span>
                </div>
              </div>

              <div class="mb-6">
                ${discount > 0 ? `
                  <div class="flex items-center mb-2">
                    <span class="text-2xl font-bold text-primary-600">
                      ${formatters.currency(this.product.finalPrice)}
                    </span>
                    <span class="badge-error ml-3">
                      -${discount}%
                    </span>
                  </div>
                  <div class="text-lg text-gray-500 line-through">
                    ${formatters.currency(this.product.price)}
                  </div>
                ` : `
                  <div class="text-3xl font-bold text-primary-600">
                    ${formatters.currency(this.product.finalPrice)}
                  </div>
                `}
              </div>

              <div class="mb-6">
                <h3 class="font-bold text-lg mb-2">Deskripsi</h3>
                <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
                  ${this.product.description}
                </p>
              </div>

              ${this.product.variants && this.product.variants.length > 0 ? `
                <div class="mb-6">
                  <h3 class="font-bold text-lg mb-3">Varian</h3>
                  <div class="space-y-4">
                    ${this.hasColorVariants() ? `
                      <div>
                        <label class="block text-sm font-medium mb-2">Warna</label>
                        <div class="flex flex-wrap gap-2" id="colorVariants">
                          ${this.renderColorVariants()}
                        </div>
                      </div>
                    ` : ''}

                    ${this.hasSizeVariants() ? `
                      <div>
                        <label class="block text-sm font-medium mb-2">Ukuran</label>
                        <div class="flex flex-wrap gap-2" id="sizeVariants">
                          ${this.renderSizeVariants()}
                        </div>
                      </div>
                    ` : ''}
                  </div>
                </div>
              ` : ''}

              <div class="mb-6">
                <label class="block text-sm font-medium mb-2">Jumlah</label>
                <div class="flex items-center space-x-4">
                  <div class="flex items-center border rounded-lg">
                    <button 
                      class="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                      onclick="window.productDetail?.decreaseQuantity()"
                    >
                      <i class="fas fa-minus"></i>
                    </button>
                    <input 
                      type="number" 
                      min="1" 
                      max="${this.product.stock}"
                      value="${this.quantity}"
                      class="w-16 text-center border-0 focus:ring-0 bg-transparent"
                      id="quantityInput"
                      onchange="window.productDetail?.updateQuantity(this.value)"
                    >
                    <button 
                      class="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                      onclick="window.productDetail?.increaseQuantity()"
                    >
                      <i class="fas fa-plus"></i>
                    </button>
                  </div>
                  
                  <div class="text-sm text-gray-500">
                    Stok: <span class="font-semibold">${this.product.stock}</span>
                  </div>
                </div>
              </div>

              <div class="flex space-x-4">
                <button 
                  class="btn-primary flex-1 py-3"
                  onclick="window.productDetail?.addToCart()"
                  ${this.product.stock === 0 ? 'disabled' : ''}
                >
                  <i class="fas fa-cart-plus mr-2"></i>
                  Tambah ke Keranjang
                </button>
                
                <button 
                  class="btn-secondary py-3 px-6"
                  onclick="window.productDetail?.addToWishlist()"
                >
                  <i class="far fa-heart"></i>
                </button>
              </div>

              <div class="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span class="text-gray-500">Kategori:</span>
                    <span class="ml-2 font-medium">${this.product.category}</span>
                  </div>
                  ${this.product.brand ? `
                    <div>
                      <span class="text-gray-500">Brand:</span>
                      <span class="ml-2 font-medium">${this.product.brand}</span>
                    </div>
                  ` : ''}
                  <div>
                    <span class="text-gray-500">SKU:</span>
                    <span class="ml-2 font-medium">${this.selectedVariant?.sku || `PROD-${this.product.id}`}</span>
                  </div>
                  <div>
                    <span class="text-gray-500">Tanggal Ditambah:</span>
                    <span class="ml-2 font-medium">${new Date(this.product.createdAt).toLocaleDateString('id-ID')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <h2 class="text-2xl font-bold mb-6">Ulasan & Rating</h2>
          ${this.renderReviewsSection()}
        </div>

      </div>
    `
  }

  // --- REVIEW METHODS ---

  renderReviewsSection() {
    // Pastikan reviewStore ada (fallback empty array jika error)
    const reviews = reviewStore ? reviewStore.getReviews(this.productId) : []
    const averageRating = reviewStore ? reviewStore.getAverageRating(this.productId) : 0
    const distribution = reviewStore ? reviewStore.getRatingDistribution(this.productId) : {}
    const totalReviews = reviews.length
    
    return `
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-1">
          <div class="card p-6">
            <div class="text-center mb-6">
              <div class="text-5xl font-bold text-primary-600 mb-2">
                ${averageRating.toFixed(1)}
              </div>
              <div class="flex justify-center mb-2">
                ${this.renderStars(averageRating)}
              </div>
              <p class="text-gray-600">${totalReviews} ulasan</p>
            </div>
            
            <div class="space-y-2">
              ${[5, 4, 3, 2, 1].map(rating => {
                const count = distribution[rating] || 0
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0
                
                return `
                  <div class="flex items-center">
                    <span class="w-10 text-sm">${rating} <i class="fas fa-star text-xs text-yellow-400"></i></span>
                    <div class="flex-1 mx-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        class="h-full bg-yellow-400"
                        style="width: ${percentage}%"
                      ></div>
                    </div>
                    <span class="w-10 text-sm text-right">${count}</span>
                  </div>
                `
              }).join('')}
            </div>
            
            <button 
              class="w-full btn-primary mt-6"
              onclick="window.productDetail?.showReviewForm()"
            >
              <i class="fas fa-edit mr-2"></i>Tulis Ulasan
            </button>
          </div>
        </div>
        
        <div class="lg:col-span-2">
          <div class="space-y-6">
            ${reviews.length === 0 ? `
              <div class="text-center py-12 card p-6">
                <div class="w-24 h-24 mx-auto mb-6 text-gray-300">
                  <i class="fas fa-comment-dots text-6xl"></i>
                </div>
                <h3 class="text-xl font-bold mb-2">Belum Ada Ulasan</h3>
                <p class="text-gray-600 dark:text-gray-400 mb-6">
                  Jadilah yang pertama mengulas produk ini
                </p>
                <button class="btn-primary" onclick="window.productDetail?.showReviewForm()">
                  <i class="fas fa-edit mr-2"></i>Tulis Ulasan Pertama
                </button>
              </div>
            ` : reviews.map(review => this.renderReviewCard(review)).join('')}
          </div>
          
          ${reviews.length > 5 ? `
            <div class="mt-8 text-center">
              <button class="btn-secondary" onclick="window.productDetail?.loadMoreReviews()">
                Lihat Semua Ulasan (${totalReviews})
              </button>
            </div>
          ` : ''}
        </div>
      </div>
    `
  }

  renderReviewCard(review) {
    return `
      <div class="card p-6">
        <div class="flex justify-between items-start mb-4">
          <div class="flex items-center">
            <img 
              src="${review.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.userName)}`}" 
              alt="${review.userName}"
              class="w-12 h-12 rounded-full mr-4 object-cover"
            >
            <div>
              <div class="font-bold">${review.userName}</div>
              <div class="flex items-center">
                <div class="mr-2 text-sm">
                  ${this.renderStars(review.rating)}
                </div>
                <span class="text-gray-500 text-sm">
                  ${new Date(review.createdAt).toLocaleDateString('id-ID')}
                </span>
              </div>
            </div>
          </div>
          
          ${review.verified ? `
            <span class="badge-success text-xs">
              <i class="fas fa-check-circle mr-1"></i>Verified
            </span>
          ` : ''}
        </div>
        
        <h4 class="font-bold text-lg mb-2">${review.title}</h4>
        <p class="text-gray-600 dark:text-gray-300 mb-4">${review.comment}</p>
        
        ${review.images && review.images.length > 0 ? `
          <div class="flex space-x-2 mb-4">
            ${review.images.slice(0, 3).map(image => `
              <img 
                src="${image}" 
                alt="Review image"
                class="w-20 h-20 rounded-lg object-cover cursor-pointer hover:opacity-80"
                onclick="window.productDetail?.viewImage('${image}')"
              >
            `).join('')}
            
            ${review.images.length > 3 ? `
              <div class="w-20 h-20 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <span class="text-gray-500">+${review.images.length - 3}</span>
              </div>
            ` : ''}
          </div>
        ` : ''}
        
        <div class="flex justify-between items-center mt-4 border-t pt-4 dark:border-gray-700">
          <div class="flex items-center space-x-4">
            <button 
              class="flex items-center text-sm text-gray-600 hover:text-primary-600 transition-colors"
              onclick="window.productDetail?.likeReview(${review.id})"
            >
              <i class="fas fa-thumbs-up mr-2"></i>
              <span>Membantu (${review.likes || 0})</span>
            </button>
          </div>
          
          <button class="text-gray-400 hover:text-red-500 transition-colors text-sm">
            <i class="fas fa-flag"></i> Laporkan
          </button>
        </div>
      </div>
    `
  }

  showReviewForm() {
    const user = storage.get('user')
    if (!user) {
      this.showNotification('Silakan login untuk menulis ulasan', 'error')
      setTimeout(() => window.location.hash = '/login', 1500)
      return
    }
    
    // Check if user has ordered this product
    const orders = storage.get('orders') || []
    const hasOrdered = orders.some(order => 
      order.userId === user.id && 
      order.items?.some(item => item.productId == this.productId)
    )
    
    // NOTE: Uncomment baris di bawah ini jika ingin enforce aturan pembelian
    // if (!hasOrdered) {
    //   this.showNotification('Hanya pembeli produk ini yang dapat memberi ulasan', 'error')
    //   return
    // }
    
    const modal = document.createElement('div')
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in'
    modal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-8 animate-slide-up shadow-2xl">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold">Tulis Ulasan</h3>
          <button 
            class="text-gray-500 hover:text-gray-700 text-2xl"
            onclick="this.closest('.fixed').remove()"
          >
            ×
          </button>
        </div>
        
        <form id="reviewForm">
          <div class="mb-6 text-center">
            <label class="block text-sm font-medium mb-3">Rating Anda</label>
            <div class="flex justify-center space-x-2" id="ratingStars">
              ${[1,2,3,4,5].map(star => `
                <button 
                  type="button"
                  class="text-4xl text-gray-300 hover:text-yellow-400 transition-colors focus:outline-none"
                  onclick="window.productDetail?.setRating(${star})"
                >
                  ★
                </button>
              `).join('')}
            </div>
            <input type="hidden" name="rating" id="selectedRating" value="0" required>
            <p class="text-sm text-red-500 mt-2 hidden" id="ratingError">Silakan pilih rating</p>
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium mb-2">Judul Ulasan</label>
            <input 
              type="text" 
              class="input w-full"
              name="title"
              placeholder="Contoh: Kualitas sangat bagus!"
              required
            >
          </div>
          
          <div class="mb-6">
            <label class="block text-sm font-medium mb-2">Detail Ulasan</label>
            <textarea 
              class="input w-full min-h-[120px]"
              name="comment"
              placeholder="Bagikan pengalaman Anda dengan produk ini..."
              required
            ></textarea>
          </div>
          
          <div class="flex justify-end space-x-3">
            <button 
              type="button"
              class="btn-secondary"
              onclick="this.closest('.fixed').remove()"
            >
              Batal
            </button>
            <button type="submit" class="btn-primary">
              Kirim Ulasan
            </button>
          </div>
        </form>
      </div>
    `
    
    document.body.appendChild(modal)
    
    // Form submission
    const form = modal.querySelector('#reviewForm')
    form.addEventListener('submit', (e) => {
      e.preventDefault()
      const formData = new FormData(form)
      const rating = parseInt(formData.get('rating'))
      
      if (!rating || rating === 0) {
        document.getElementById('ratingError').classList.remove('hidden')
        return
      }

      const reviewData = {
        title: formData.get('title'),
        comment: formData.get('comment'),
        rating: rating,
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar || null,
        images: [], // Placeholder for image upload feature
        verified: hasOrdered,
        likes: 0
      }
      
      // Save review
      reviewStore.addReview(this.productId, reviewData)
      
      // Close modal
      modal.remove()
      
      // Show success message
      this.showNotification('Ulasan berhasil dikirim!', 'success')
      
      // Refresh page content (simpel reload untuk update UI)
      // Alternatif: Re-render partial string dan inject ke DOM
      setTimeout(() => window.location.reload(), 1000)
    })
  }

  setRating(rating) {
    const input = document.getElementById('selectedRating')
    const buttons = document.querySelectorAll('#ratingStars button')
    
    if (input) input.value = rating
    
    buttons.forEach((btn, index) => {
      if (index < rating) {
        btn.classList.add('text-yellow-400')
        btn.classList.remove('text-gray-300')
      } else {
        btn.classList.add('text-gray-300')
        btn.classList.remove('text-yellow-400')
      }
    })
  }

  // --- EXISTING METHODS ---

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

  hasColorVariants() {
    return this.product.variants && 
           new Set(this.product.variants.map(v => v.color)).size > 1
  }

  hasSizeVariants() {
    return this.product.variants && 
           new Set(this.product.variants.map(v => v.size)).size > 1
  }

  renderColorVariants() {
    const colors = [...new Set(this.product.variants.map(v => v.color))]
    return colors.map(color => `
      <button 
        class="px-4 py-2 rounded-lg border ${this.selectedVariant?.color === color ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-300 hover:border-primary-400'}"
        onclick="window.productDetail?.selectColor('${color}')"
      >
        ${color}
      </button>
    `).join('')
  }

  renderSizeVariants() {
    const sizes = [...new Set(this.product.variants.map(v => v.size))]
    return sizes.map(size => `
      <button 
        class="px-4 py-2 rounded-lg border ${this.selectedVariant?.size === size ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-300 hover:border-primary-400'}"
        onclick="window.productDetail?.selectSize('${size}')"
      >
        ${size}
      </button>
    `).join('')
  }

  renderNotFound() {
    return `
      <div class="text-center py-20">
        <div class="text-9xl text-gray-300 mb-6">404</div>
        <h2 class="text-3xl font-bold mb-4">Produk Tidak Ditemukan</h2>
        <p class="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
          Produk yang Anda cari tidak tersedia atau telah dihapus.
        </p>
        <a href="#/products" class="btn-primary inline-block">
          <i class="fas fa-arrow-left mr-2"></i>Kembali ke Produk
        </a>
      </div>
    `
  }

  // Methods for template to call
  selectImage(index) {
    this.selectedImage = index
    const mainImage = document.getElementById('mainImage')
    if (mainImage) {
      mainImage.src = this.product.images[index]
    }
  }

  selectColor(color) {
    const variant = this.product.variants.find(v => v.color === color && 
      (!this.selectedVariant?.size || v.size === this.selectedVariant.size))
    if (variant) {
      this.selectedVariant = variant
      this.updateVariantButtons()
    }
  }

  selectSize(size) {
    const variant = this.product.variants.find(v => v.size === size && 
      (!this.selectedVariant?.color || v.color === this.selectedVariant.color))
    if (variant) {
      this.selectedVariant = variant
      this.updateVariantButtons()
    }
  }

  updateVariantButtons() {
    // Update active state for color buttons
    document.querySelectorAll('#colorVariants button').forEach(btn => {
      const color = btn.textContent.trim()
      if (color === this.selectedVariant?.color) {
        btn.className = 'px-4 py-2 rounded-lg border border-primary-500 bg-primary-50 text-primary-700'
      } else {
        btn.className = 'px-4 py-2 rounded-lg border border-gray-300 hover:border-primary-400'
      }
    })

    // Update active state for size buttons
    document.querySelectorAll('#sizeVariants button').forEach(btn => {
      const size = btn.textContent.trim()
      if (size === this.selectedVariant?.size) {
        btn.className = 'px-4 py-2 rounded-lg border border-primary-500 bg-primary-50 text-primary-700'
      } else {
        btn.className = 'px-4 py-2 rounded-lg border border-gray-300 hover:border-primary-400'
      }
    })
  }

  increaseQuantity() {
    if (this.quantity < this.product.stock) {
      this.quantity++
      document.getElementById('quantityInput').value = this.quantity
    }
  }

  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity--
      document.getElementById('quantityInput').value = this.quantity
    }
  }

  updateQuantity(value) {
    const numValue = parseInt(value) || 1
    this.quantity = Math.max(1, Math.min(numValue, this.product.stock))
    document.getElementById('quantityInput').value = this.quantity
  }

  addToCart() {
    if (this.product.stock === 0) {
      this.showNotification('Produk stok habis!', 'error')
      return
    }

    cartStore.addItem(this.product, this.selectedVariant, this.quantity)
    this.showNotification('Produk ditambahkan ke keranjang!', 'success')
  }

  addToWishlist() {
    this.showNotification('Ditambahkan ke wishlist!', 'info')
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div')
    notification.className = `
      fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg 
      animate-slide-up ${type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'} text-white
      flex items-center
    `
    notification.innerHTML = `
      <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} mr-2"></i>
      <span>${message}</span>
    `
    
    document.body.appendChild(notification)
    
    setTimeout(() => {
      notification.classList.add('opacity-0', 'transition-opacity', 'duration-300')
      setTimeout(() => notification.remove(), 300)
    }, 2000)
  }

  attachEvents() {
    // Make methods available to template
    window.productDetail = this

    // Image zoom effect
    const mainImage = document.getElementById('mainImage')
    if (mainImage) {
      mainImage.addEventListener('click', () => {
        mainImage.classList.toggle('cursor-zoom-out')
        mainImage.classList.toggle('scale-150')
        mainImage.classList.toggle('transition-transform')
        mainImage.classList.toggle('duration-300')
      })
    }
  }

  destroy() {
    delete window.productDetail
  }
}