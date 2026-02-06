import { productStore } from '../stores/productStore.js'
import { cartStore } from '../stores/cartStore.js'
import { reviewStore } from '../stores/reviewStore.js'
import { storage } from '../utils/storage.js'
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
          <span class="text-gray-800 dark:text-gray-300 font-medium">${this.product.name}</span>
        </nav>

        <div class="card overflow-hidden mb-12">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            
            <div>
              <div class="mb-4 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 relative group">
                <img 
                  src="${this.product.images[this.selectedImage]}" 
                  alt="${this.product.name}"
                  class="w-full h-96 object-contain cursor-zoom-in transition-transform duration-300"
                  id="mainImage"
                >
                <div class="absolute inset-0 pointer-events-none group-hover:bg-black/5 transition-colors"></div>
              </div>

              ${this.product.images.length > 1 ? `
                <div class="flex space-x-3 overflow-x-auto pb-2 custom-scrollbar">
                  ${this.product.images.map((image, index) => `
                    <button 
                      class="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${index === this.selectedImage ? 'border-primary-500' : 'border-transparent hover:border-gray-300'}"
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
                  <h1 class="text-3xl font-bold text-gray-900 dark:text-white">${this.product.name}</h1>
                  ${this.product.featured ? `
                    <span class="badge-primary whitespace-nowrap ml-4">
                      <i class="fas fa-star mr-1"></i> Unggulan
                    </span>
                  ` : ''}
                </div>
                
                <div class="flex items-center space-x-4 mb-4">
                  <div class="flex items-center">
                    ${this.renderStars(this.product.rating)}
                    <span class="ml-2 text-gray-600 dark:text-gray-400 text-sm">
                      ${this.product.rating} (${this.product.reviewCount || 0} ulasan)
                    </span>
                  </div>
                  <span class="text-gray-300 dark:text-gray-600">•</span>
                  <span class="${this.product.stock > 0 ? 'text-green-600' : 'text-red-600'} text-sm font-medium flex items-center">
                    <i class="fas ${this.product.stock > 0 ? 'fa-check-circle' : 'fa-times-circle'} mr-1"></i>
                    ${this.product.stock > 0 ? 'Stok Tersedia' : 'Stok Habis'}
                  </span>
                </div>
              </div>

              <div class="mb-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                ${discount > 0 ? `
                  <div class="flex items-end gap-3 mb-1">
                    <span class="text-3xl font-bold text-primary-600">
                      ${formatters.currency(this.product.finalPrice)}
                    </span>
                    <span class="text-lg text-gray-500 line-through mb-1">
                      ${formatters.currency(this.product.price)}
                    </span>
                    <span class="badge-error mb-2">
                      Hemat ${discount}%
                    </span>
                  </div>
                ` : `
                  <div class="text-3xl font-bold text-primary-600">
                    ${formatters.currency(this.product.finalPrice)}
                  </div>
                `}
              </div>

              <div class="mb-8">
                <h3 class="font-bold text-lg mb-2">Deskripsi</h3>
                <p class="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                  ${this.product.description}
                </p>
              </div>

              ${this.product.variants && this.product.variants.length > 0 ? `
                <div class="mb-8 space-y-6">
                  ${this.hasColorVariants() ? `
                    <div>
                      <label class="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">Pilih Warna</label>
                      <div class="flex flex-wrap gap-3" id="colorVariants">
                        ${this.renderColorVariants()}
                      </div>
                    </div>
                  ` : ''}

                  ${this.hasSizeVariants() ? `
                    <div>
                      <label class="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">Pilih Ukuran</label>
                      <div class="flex flex-wrap gap-3" id="sizeVariants">
                        ${this.renderSizeVariants()}
                      </div>
                    </div>
                  ` : ''}
                </div>
              ` : ''}

              <div class="mb-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <label class="block text-sm font-medium mb-3">Jumlah Pembelian</label>
                <div class="flex flex-col sm:flex-row gap-4">
                  
                  <div class="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 w-fit">
                    <button 
                      class="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 transition-colors rounded-l-lg"
                      onclick="window.productDetail?.decreaseQuantity()"
                    >
                      <i class="fas fa-minus text-xs"></i>
                    </button>
                    <input 
                      type="number" 
                      min="1" 
                      max="${this.product.stock}"
                      value="${this.quantity}"
                      class="w-16 text-center border-0 focus:ring-0 bg-transparent font-semibold p-0"
                      id="quantityInput"
                      onchange="window.productDetail?.updateQuantity(this.value)"
                    >
                    <button 
                      class="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 transition-colors rounded-r-lg"
                      onclick="window.productDetail?.increaseQuantity()"
                    >
                      <i class="fas fa-plus text-xs"></i>
                    </button>
                  </div>

                  <div class="flex flex-1 gap-3">
                    <button 
                      class="btn-primary flex-1 py-3 text-lg shadow-lg shadow-primary-500/30"
                      onclick="window.productDetail?.addToCart()"
                      ${this.product.stock === 0 ? 'disabled' : ''}
                    >
                      <i class="fas fa-cart-plus mr-2"></i>
                      Beli Sekarang
                    </button>
                    
                    <button 
                      class="btn-secondary px-4 py-3"
                      onclick="window.productDetail?.addToWishlist()"
                      title="Tambah ke Wishlist"
                    >
                      <i class="far fa-heart text-xl"></i>
                    </button>
                  </div>
                </div>
                <p class="mt-2 text-xs text-gray-500">
                  Tersisa ${this.product.stock} stok lagi untuk varian ini
                </p>
              </div>

              <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 text-sm space-y-2">
                <div class="flex justify-between">
                  <span class="text-gray-500">Kategori</span>
                  <span class="font-medium text-gray-900 dark:text-white capitalize">${this.product.category}</span>
                </div>
                ${this.product.brand ? `
                  <div class="flex justify-between">
                    <span class="text-gray-500">Brand</span>
                    <span class="font-medium text-gray-900 dark:text-white">${this.product.brand}</span>
                  </div>
                ` : ''}
                <div class="flex justify-between">
                  <span class="text-gray-500">SKU</span>
                  <span class="font-medium text-gray-900 dark:text-white font-mono">${this.selectedVariant?.sku || `PRD-${this.product.id}`}</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        <div class="mt-12">
          <h2 class="text-2xl font-bold mb-6 flex items-center">
            Ulasan Pelanggan
            <span class="ml-3 text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              ${this.product.reviewCount || 0}
            </span>
          </h2>
          ${this.renderReviewsSection()}
        </div>

      </div>
    `
  }

  // --- REVIEW METHODS ---

  renderReviewsSection() {
    // Ambil data real dari store, fallback ke array kosong
    const reviews = reviewStore ? reviewStore.getReviews(this.productId) : []
    const averageRating = reviewStore ? reviewStore.getAverageRating(this.productId) : 0
    const distribution = reviewStore ? reviewStore.getRatingDistribution(this.productId) : {}
    const totalReviews = reviews.length
    
    return `
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-1">
          <div class="card p-6 sticky top-24">
            <div class="text-center mb-6">
              <div class="text-5xl font-bold text-primary-600 mb-2">
                ${averageRating.toFixed(1)}
              </div>
              <div class="flex justify-center mb-2">
                ${this.renderStars(averageRating)}
              </div>
              <p class="text-gray-600 dark:text-gray-400">Berdasarkan ${totalReviews} ulasan</p>
            </div>
            
            <div class="space-y-3 mb-8">
              ${[5, 4, 3, 2, 1].map(rating => {
                const count = distribution[rating] || 0
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0
                
                return `
                  <div class="flex items-center text-sm">
                    <span class="w-12 flex items-center">
                      ${rating} <i class="fas fa-star text-xs ml-1 text-gray-400"></i>
                    </span>
                    <div class="flex-1 mx-3 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        class="h-full bg-yellow-400 rounded-full"
                        style="width: ${percentage}%"
                      ></div>
                    </div>
                    <span class="w-8 text-right text-gray-500">${count}</span>
                  </div>
                `
              }).join('')}
            </div>
            
            <button 
              class="w-full btn-outline py-3 border-2 font-semibold"
              onclick="window.productDetail?.showReviewForm()"
            >
              <i class="fas fa-pen mr-2"></i>Tulis Ulasan
            </button>
          </div>
        </div>
        
        <div class="lg:col-span-2">
          <div class="space-y-6">
            ${reviews.length === 0 ? `
              <div class="text-center py-12 card border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <div class="w-16 h-16 mx-auto mb-4 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm text-gray-300">
                  <i class="fas fa-comment-dots text-3xl"></i>
                </div>
                <h3 class="text-lg font-bold mb-1">Belum Ada Ulasan</h3>
                <p class="text-gray-500 dark:text-gray-400 mb-6 text-sm">
                  Jadilah yang pertama membagikan pengalaman Anda
                </p>
                <button class="btn-primary" onclick="window.productDetail?.showReviewForm()">
                  Tulis Ulasan Pertama
                </button>
              </div>
            ` : reviews.map(review => this.renderReviewCard(review)).join('')}
          </div>
          
          ${reviews.length > 5 ? `
            <div class="mt-8 text-center">
              <button class="btn-ghost text-primary-600 font-medium">
                Lihat Semua Ulasan
                <i class="fas fa-chevron-down ml-2"></i>
              </button>
            </div>
          ` : ''}
        </div>
      </div>
    `
  }

  renderReviewCard(review) {
    return `
      <div class="card p-6 animate-fade-in">
        <div class="flex justify-between items-start mb-4">
          <div class="flex items-center">
            <img 
              src="${review.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.userName)}&background=random`}" 
              alt="${review.userName}"
              class="w-10 h-10 rounded-full mr-4 object-cover ring-2 ring-gray-100"
            >
            <div>
              <div class="font-bold text-gray-900 dark:text-white text-sm">${review.userName}</div>
              <div class="flex items-center mt-1">
                <div class="flex text-xs mr-2">
                  ${this.renderStars(review.rating)}
                </div>
                <span class="text-gray-400 text-xs">•</span>
                <span class="text-gray-500 text-xs ml-2">
                  ${new Date(review.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
          
          ${review.verified ? `
            <span class="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-full border border-green-100 flex items-center">
              <i class="fas fa-check-circle mr-1"></i> Terverifikasi
            </span>
          ` : ''}
        </div>
        
        <h4 class="font-bold text-base mb-2 text-gray-800 dark:text-gray-200">${review.title}</h4>
        <p class="text-gray-600 dark:text-gray-300 mb-4 text-sm leading-relaxed">${review.comment}</p>
        
        ${review.images && review.images.length > 0 ? `
          <div class="flex gap-2 mb-4 overflow-x-auto pb-2">
            ${review.images.slice(0, 3).map(image => `
              <img 
                src="${image}" 
                alt="Review image"
                class="w-20 h-20 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity border border-gray-200 dark:border-gray-700"
                onclick="window.open('${image}', '_blank')"
              >
            `).join('')}
             ${review.images.length > 3 ? `
              <div class="w-20 h-20 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 text-xs font-medium border border-gray-200 dark:border-gray-700">
                +${review.images.length - 3} Foto
              </div>
            ` : ''}
          </div>
        ` : ''}
        
        <div class="flex items-center space-x-6 border-t border-gray-100 dark:border-gray-700 pt-4 mt-2">
          <button 
            class="flex items-center text-xs text-gray-500 hover:text-primary-600 transition-colors"
            onclick="window.productDetail?.likeReview(${review.id})"
          >
            <i class="far fa-thumbs-up mr-2 text-base"></i>
            <span>Membantu (${review.likes || 0})</span>
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
    
    // Optional: Enforce verified purchase
    // if (!hasOrdered) {
    //   this.showNotification('Anda harus membeli produk ini sebelum memberi ulasan', 'error')
    //   return
    // }
    
    const modal = document.createElement('div')
    modal.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in'
    modal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-8 animate-slide-up shadow-2xl relative">
        <button 
          class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          onclick="this.closest('.fixed').remove()"
        >
          ×
        </button>

        <h3 class="text-xl font-bold mb-1 text-center">Bagaimana produknya?</h3>
        <p class="text-center text-gray-500 text-sm mb-6">Rating Anda sangat berarti bagi kami</p>
        
        <form id="reviewForm">
          <div class="mb-8 text-center">
            <div class="flex justify-center gap-2 mb-2" id="ratingStars">
              ${[1,2,3,4,5].map(star => `
                <button 
                  type="button"
                  class="text-4xl text-gray-200 hover:text-yellow-400 transition-colors focus:outline-none transform hover:scale-110 duration-200"
                  onclick="window.productDetail?.setRating(${star})"
                >
                  <i class="fas fa-star"></i>
                </button>
              `).join('')}
            </div>
            <p class="text-sm font-medium text-yellow-500 h-5" id="ratingLabel">Pilih rating</p>
            <input type="hidden" name="rating" id="selectedRating" value="0" required>
            <p class="text-xs text-red-500 mt-2 hidden" id="ratingError">Mohon pilih rating bintang</p>
          </div>
          
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold uppercase text-gray-500 mb-1">Judul</label>
              <input 
                type="text" 
                class="input w-full font-medium"
                name="title"
                placeholder="Cth: Kualitas bagus, pengiriman cepat!"
                required
              >
            </div>
            
            <div>
              <label class="block text-xs font-bold uppercase text-gray-500 mb-1">Ulasan Lengkap</label>
              <textarea 
                class="input w-full min-h-[100px] leading-relaxed"
                name="comment"
                placeholder="Ceritakan kepuasan Anda tentang kualitas bahan, ukuran, dan pengiriman..."
                required
              ></textarea>
            </div>

            <div>
               <label class="block text-xs font-bold uppercase text-gray-500 mb-1">Foto (Opsional)</label>
               <div class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer">
                  <i class="fas fa-camera text-gray-400 text-xl mb-1"></i>
                  <p class="text-xs text-gray-500">Tambah Foto</p>
               </div>
            </div>
          </div>
          
          <div class="mt-8 grid grid-cols-2 gap-3">
            <button 
              type="button"
              class="btn-secondary py-3"
              onclick="this.closest('.fixed').remove()"
            >
              Batal
            </button>
            <button type="submit" class="btn-primary py-3">
              Kirim Ulasan
            </button>
          </div>
        </form>
      </div>
    `
    
    document.body.appendChild(modal)
    
    // Form submission logic
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
        images: [], // Placeholder for future image upload implementation
        verified: hasOrdered,
        likes: 0
      }
      
      // Save review
      reviewStore.addReview(this.productId, reviewData)
      
      modal.remove()
      this.showNotification('Terima kasih! Ulasan berhasil dikirim.', 'success')
      
      // Refresh page content logic
      // Idealnya re-render partial, tapi reload simple works for MVP
      setTimeout(() => window.location.reload(), 1000)
    })
  }

  setRating(rating) {
    const input = document.getElementById('selectedRating')
    const buttons = document.querySelectorAll('#ratingStars button')
    const label = document.getElementById('ratingLabel')
    const labels = ["Sangat Buruk", "Buruk", "Cukup", "Bagus", "Sangat Bagus"]

    if (input) input.value = rating
    if (label) label.textContent = labels[rating - 1]
    
    buttons.forEach((btn, index) => {
      if (index < rating) {
        btn.className = "text-4xl text-yellow-400 transition-colors focus:outline-none transform scale-110 duration-200"
      } else {
        btn.className = "text-4xl text-gray-200 hover:text-yellow-200 transition-colors focus:outline-none transform hover:scale-110 duration-200"
      }
    })
    
    document.getElementById('ratingError').classList.add('hidden')
  }

  // --- HELPER METHODS ---

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
      stars += '<i class="far fa-star text-gray-300"></i>'
    }
    
    return stars
  }

  hasColorVariants() {
    return this.product.variants && new Set(this.product.variants.map(v => v.color)).size > 1
  }

  hasSizeVariants() {
    return this.product.variants && new Set(this.product.variants.map(v => v.size)).size > 1
  }

  renderColorVariants() {
    const colors = [...new Set(this.product.variants.map(v => v.color))]
    return colors.map(color => `
      <button 
        class="px-4 py-2 rounded-lg border text-sm font-medium transition-all ${this.selectedVariant?.color === color ? 'border-primary-500 ring-1 ring-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 hover:border-gray-400 bg-white'}"
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
        class="min-w-[3rem] px-3 py-2 rounded-lg border text-sm font-medium transition-all ${this.selectedVariant?.size === size ? 'border-primary-500 ring-1 ring-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 hover:border-gray-400 bg-white'}"
        onclick="window.productDetail?.selectSize('${size}')"
      >
        ${size}
      </button>
    `).join('')
  }

  renderNotFound() {
    return `
      <div class="text-center py-20">
        <div class="text-9xl text-gray-200 mb-6 font-bold">404</div>
        <h2 class="text-3xl font-bold mb-4">Produk Tidak Ditemukan</h2>
        <p class="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
          Produk yang Anda cari tidak tersedia atau telah dihapus dari katalog kami.
        </p>
        <a href="#/products" class="btn-primary inline-block">
          <i class="fas fa-arrow-left mr-2"></i>Kembali ke Katalog
        </a>
      </div>
    `
  }

  // --- ACTIONS ---

  selectImage(index) {
    this.selectedImage = index
    const mainImage = document.getElementById('mainImage')
    if (mainImage) {
      // Add fade effect
      mainImage.style.opacity = '0'
      setTimeout(() => {
        mainImage.src = this.product.images[index]
        mainImage.style.opacity = '1'
      }, 150)
      
      // Update active thumbnail border
      // (Simplified logic here, full implementation requires managing classes on thumbnails)
    }
  }

  selectColor(color) {
    const variant = this.product.variants.find(v => v.color === color && 
      (!this.selectedVariant?.size || v.size === this.selectedVariant.size))
    if (variant) {
      this.selectedVariant = variant
      this.render().then(html => {
         // Hot reload partials would be better, but re-rendering full page works
         document.getElementById('main-content').innerHTML = html
         this.attachEvents()
      })
    }
  }

  selectSize(size) {
    const variant = this.product.variants.find(v => v.size === size && 
      (!this.selectedVariant?.color || v.color === this.selectedVariant.color))
    if (variant) {
      this.selectedVariant = variant
      this.render().then(html => {
         document.getElementById('main-content').innerHTML = html
         this.attachEvents()
      })
    }
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
      this.showNotification('Maaf, stok produk sedang habis.', 'error')
      return
    }

    cartStore.addItem(this.product, this.selectedVariant, this.quantity)
    this.showNotification('Produk berhasil ditambahkan ke keranjang!', 'success')
  }

  addToWishlist() {
    this.showNotification('Produk ditambahkan ke Wishlist', 'success')
  }
  
  likeReview(reviewId) {
    if (reviewStore) {
        reviewStore.likeReview(reviewId)
        // Refresh UI simple
        // In real app, just update the counter span
    }
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div')
    const bgClass = type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600'
    const iconClass = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'
    
    notification.className = `
      fixed top-24 right-4 z-50 px-6 py-4 rounded-lg shadow-xl 
      animate-slide-up ${bgClass} text-white
      flex items-center gap-3 min-w-[300px]
    `
    notification.innerHTML = `
      <i class="fas ${iconClass} text-xl"></i>
      <div>
        <h4 class="font-bold text-sm uppercase opacity-90">${type}</h4>
        <p class="text-sm font-medium">${message}</p>
      </div>
    `
    
    document.body.appendChild(notification)
    
    setTimeout(() => {
      notification.style.opacity = '0'
      notification.style.transform = 'translateY(-20px)'
      notification.style.transition = 'all 0.3s ease'
      setTimeout(() => notification.remove(), 300)
    }, 3000)
  }

  attachEvents() {
    window.productDetail = this

    // Image zoom effect
    const mainImage = document.getElementById('mainImage')
    if (mainImage) {
      mainImage.addEventListener('mousemove', (e) => {
        const { left, top, width, height } = mainImage.getBoundingClientRect()
        const x = (e.clientX - left) / width * 100
        const y = (e.clientY - top) / height * 100
        mainImage.style.transformOrigin = `${x}% ${y}%`
      })
      
      mainImage.addEventListener('mouseenter', () => {
        mainImage.classList.add('scale-150')
      })
      
      mainImage.addEventListener('mouseleave', () => {
        mainImage.classList.remove('scale-150')
        mainImage.style.transformOrigin = 'center center'
      })
    }
  }

  destroy() {
    delete window.productDetail
  }
}