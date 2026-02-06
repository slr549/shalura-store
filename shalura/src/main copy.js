import './style.css'
import { Header } from './layouts/Header.js'
import { Footer } from './layouts/Footer.js'
import { api } from './utils/api.js'
import { storage } from './utils/storage.js'
import { ProductsPage } from './pages/ProductsPage.js'
import { ProductDetailPage } from './pages/ProductDetailPage.js'
import { CartPage } from './pages/CartPage.js'

class FashionStoreApp {
  constructor() {
    this.currentPage = 'home'
    this.init()
  }

  async init() {
    console.log('🛍️ FashionStore App Initializing...')
    
    // Setup layout
    this.setupLayout()
    
    // Test API connection
    await this.testApiConnection()
    
    // Setup router
    this.setupRouter()
    
    // Load initial page
    await this.loadPage()
  }

  setupLayout() {
    const app = document.getElementById('app')
    
    // Header
    const header = new Header()
    app.insertAdjacentHTML('afterbegin', header.render())
    header.attachEvents()
    
    // Main content area
    app.insertAdjacentHTML('beforeend', `
      <main id="main-content" class="flex-1 container mx-auto px-4 py-8">
        <div class="animate-fade-in">
          <!-- Content will be loaded here -->
        </div>
      </main>
    `)
    
    // Footer
    const footer = new Footer()
    app.insertAdjacentHTML('beforeend', footer.render())
  }

  async testApiConnection() {
    try {
      const categories = await api.getCategories()
      console.log('✅ API Connected! Categories:', categories.length)
    } catch (error) {
      console.warn('⚠️ API not connected. Running in offline mode.')
    }
  }

  setupRouter() {
    window.addEventListener('hashchange', () => this.loadPage())
  }

  async loadPage() {
    const hash = window.location.hash.slice(1) || '/'
    const mainContent = document.getElementById('main-content')
    
    // Show loading
    mainContent.innerHTML = `
      <div class="flex items-center justify-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    `
    
    try {
      let content = ''
      
      switch (hash) {
        case '/':
          content = await this.renderHomePage()
          break
        case '/products':
          content = await this.renderProductsPage()
          break
        case '/cart':
          content = await this.renderCartPage()
          break
        case '/login':
          content = await this.renderLoginPage()
          break
        default:
          content = this.renderNotFoundPage()
      }
      
      mainContent.innerHTML = content
      this.attachPageEvents()
    } catch (error) {
      console.error('Error loading page:', error)
      mainContent.innerHTML = `
        <div class="text-center py-12">
          <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
          <h2 class="text-2xl font-bold mb-2">Terjadi Kesalahan</h2>
          <p class="text-gray-600 dark:text-gray-400">${error.message}</p>
          <a href="#/" class="btn-primary mt-4 inline-block">Kembali ke Home</a>
        </div>
      `
    }
  }

  async renderHomePage() {
    let featuredProducts = []
    
    try {
      featuredProducts = await api.getFeaturedProducts()
    } catch (error) {
      console.log('Using mock data for featured products')
      featuredProducts = [
        {
          id: 1,
          name: 'Kemeja Flanel Premium',
          price: 299000,
          discount: 20,
          finalPrice: 239200,
          images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&h=800&fit=crop'],
          rating: 4.5,
          reviewCount: 128
        },
        // ... more mock products
      ]
    }
    
    return `
      <div class="animate-fade-in">
        <!-- Hero Section -->
        <section class="mb-16">
          <div class="relative rounded-2xl overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-r from-primary-600 to-purple-600"></div>
            <div class="relative z-10 px-8 py-16 md:py-24 text-center">
              <h1 class="text-4xl md:text-6xl font-bold text-white mb-4">
                Fashion Terbaru <br> untuk Gaya Anda
              </h1>
              <p class="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Temukan koleksi fashion premium dengan kualitas terbaik dan harga terjangkau
              </p>
              <div class="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="#/products" class="btn-primary text-lg px-8 py-3">
                  <i class="fas fa-shopping-bag mr-2"></i>Belanja Sekarang
                </a>
                <a href="#/categories" class="btn-secondary text-lg px-8 py-3">
                  <i class="fas fa-tags mr-2"></i>Lihat Kategori
                </a>
              </div>
            </div>
          </div>
        </section>

        <!-- Featured Products -->
        <section class="mb-16">
          <div class="flex justify-between items-center mb-8">
            <h2 class="text-3xl font-bold">Produk Unggulan</h2>
            <a href="#/products" class="text-primary-600 hover:text-primary-700 font-medium">
              Lihat Semua <i class="fas fa-arrow-right ml-1"></i>
            </a>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            ${featuredProducts.slice(0, 4).map(product => `
              <div class="product-card group">
                <div class="relative overflow-hidden">
                  <img 
                    src="${product.images[0]}" 
                    alt="${product.name}"
                    class="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  >
                  ${product.discount > 0 ? `
                    <div class="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      -${product.discount}%
                    </div>
                  ` : ''}
                </div>
                <div class="p-4">
                  <h3 class="font-semibold text-lg mb-2 truncate">${product.name}</h3>
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center space-x-1">
                      <i class="fas fa-star text-yellow-400"></i>
                      <span>${product.rating}</span>
                      <span class="text-gray-500 text-sm">(${product.reviewCount})</span>
                    </div>
                    <div class="text-right">
                      ${product.discount > 0 ? `
                        <div class="text-gray-500 line-through text-sm">
                          Rp ${product.price.toLocaleString('id-ID')}
                        </div>
                      ` : ''}
                      <div class="font-bold text-lg text-primary-600">
                        Rp ${product.finalPrice.toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>
                  <button 
                    class="w-full btn-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    data-add-to-cart="${product.id}"
                  >
                    <i class="fas fa-cart-plus mr-2"></i>Tambah ke Keranjang
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </section>

        <!-- Features -->
        <section class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div class="text-center p-6 card">
            <div class="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-shipping-fast text-2xl"></i>
            </div>
            <h3 class="font-bold text-xl mb-2">Gratis Ongkir</h3>
            <p class="text-gray-600">Gratis pengiriman untuk order di atas Rp 300.000</p>
          </div>
          
          <div class="text-center p-6 card">
            <div class="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-shield-alt text-2xl"></i>
            </div>
            <h3 class="font-bold text-xl mb-2">Garansi 30 Hari</h3>
            <p class="text-gray-600">Garansi pengembalian 30 hari jika tidak cocok</p>
          </div>
          
          <div class="text-center p-6 card">
            <div class="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-headset text-2xl"></i>
            </div>
            <h3 class="font-bold text-xl mb-2">Support 24/7</h3>
            <p class="text-gray-600">Customer service siap membantu kapan saja</p>
          </div>
        </section>
      </div>
    `
  }

  renderProductsPage() {
    return `
      <div class="animate-fade-in">
        <h1 class="text-3xl font-bold mb-8">Semua Produk</h1>
        <div class="text-center py-12">
          <i class="fas fa-store text-4xl text-gray-300 mb-4"></i>
          <p class="text-gray-600">Halaman produk akan segera tersedia</p>
          <a href="#/" class="btn-primary mt-4 inline-block">Kembali ke Home</a>
        </div>
      </div>
    `
  }

  renderCartPage() {
    return `
      <div class="animate-fade-in">
        <h1 class="text-3xl font-bold mb-8">Keranjang Belanja</h1>
        <div class="text-center py-12">
          <i class="fas fa-shopping-cart text-4xl text-gray-300 mb-4"></i>
          <p class="text-gray-600">Fitur keranjang akan segera tersedia</p>
          <a href="#/products" class="btn-primary mt-4 inline-block">Lanjut Belanja</a>
        </div>
      </div>
    `
  }

  renderLoginPage() {
    return `
      <div class="max-w-md mx-auto animate-slide-up">
        <div class="card p-8">
          <h2 class="text-2xl font-bold mb-6 text-center">Masuk ke Akun Anda</h2>
          
          <form id="loginForm">
            <div class="mb-4">
              <label class="block text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <input 
                type="email" 
                class="input"
                placeholder="email@contoh.com"
                required
              >
            </div>
            
            <div class="mb-6">
              <label class="block text-gray-700 dark:text-gray-300 mb-2">Password</label>
              <input 
                type="password" 
                class="input"
                placeholder="••••••••"
                required
              >
            </div>
            
            <button type="submit" class="w-full btn-primary py-3">
              <i class="fas fa-sign-in-alt mr-2"></i>Masuk
            </button>
          </form>
          
          <div class="mt-6 text-center">
            <p class="text-gray-600 dark:text-gray-400">
              Belum punya akun?
              <a href="#/register" class="text-primary-600 hover:text-primary-700 font-medium">
                Daftar di sini
              </a>
            </p>
          </div>
          
          <div class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p class="text-center text-sm text-gray-500 mb-4">Atau gunakan akun demo:</p>
            <div class="grid grid-cols-2 gap-3">
              <button 
                class="btn-secondary"
                data-demo-login="admin@store.com"
              >
                <i class="fas fa-user-shield mr-2"></i>Admin
              </button>
              <button 
                class="btn-secondary"
                data-demo-login="user@mail.com"
              >
                <i class="fas fa-user mr-2"></i>User
              </button>
            </div>
          </div>
        </div>
      </div>
    `
  }

  renderNotFoundPage() {
    return `
      <div class="text-center py-20 animate-fade-in">
        <div class="text-9xl text-gray-300 mb-6">404</div>
        <h2 class="text-3xl font-bold mb-4">Halaman Tidak Ditemukan</h2>
        <p class="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
          Halaman yang Anda cari tidak tersedia atau telah dipindahkan.
        </p>
        <a href="#/" class="btn-primary inline-block">
          <i class="fas fa-home mr-2"></i>Kembali ke Home
        </a>
      </div>
    `
  }

  attachPageEvents() {
    // Add to cart buttons
    document.querySelectorAll('[data-add-to-cart]').forEach(button => {
      button.addEventListener('click', (e) => {
        const productId = e.target.dataset.addToCart
        this.addToCart(productId)
      })
    })

    // Login form
    const loginForm = document.getElementById('loginForm')
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault()
        const email = loginForm.querySelector('input[type="email"]').value
        const password = loginForm.querySelector('input[type="password"]').value
        this.handleLogin(email, password)
      })
    }

    // Demo login buttons
    document.querySelectorAll('[data-demo-login]').forEach(button => {
      button.addEventListener('click', (e) => {
        const email = e.target.dataset.demoLogin
        const password = email.includes('admin') ? 'admin123' : 'user123'
        this.handleLogin(email, password)
      })
    })
  }

  async addToCart(productId) {
    const user = storage.get('user')
    if (!user) {
      alert('Silakan login terlebih dahulu untuk menambah ke keranjang')
      window.location.hash = '/login'
      return
    }

    try {
      // In a real app, you would call api.addToCart()
      const currentCart = storage.get('cart') || { items: [] }
      const existingItem = currentCart.items.find(item => item.productId == productId)
      
      if (existingItem) {
        existingItem.quantity += 1
      } else {
        currentCart.items.push({
          productId,
          quantity: 1,
          addedAt: new Date().toISOString()
        })
      }
      
      storage.set('cart', currentCart)
      
      // Show success message
      this.showNotification('Produk berhasil ditambahkan ke keranjang!', 'success')
      
      // Update cart count in header
      this.updateCartCount()
    } catch (error) {
      this.showNotification('Gagal menambahkan ke keranjang', 'error')
    }
  }

  async handleLogin(email, password) {
    try {
      const response = await api.login(email, password)
      
      if (response.success) {
        storage.set('user', response.user)
        storage.set('token', response.token)
        
        this.showNotification('Login berhasil!', 'success')
        
        // Redirect to home
        setTimeout(() => {
          window.location.hash = '/'
        }, 1000)
      } else {
        this.showNotification('Email atau password salah', 'error')
      }
    } catch (error) {
      // Fallback to mock login for demo
      const mockUsers = [
        { email: 'admin@store.com', password: 'admin123', name: 'Admin Store', role: 'admin' },
        { email: 'user@mail.com', password: 'user123', name: 'Budi Santoso', role: 'customer' }
      ]
      
      const user = mockUsers.find(u => u.email === email && u.password === password)
      
      if (user) {
        const { password: _, ...userWithoutPassword } = user
        storage.set('user', userWithoutPassword)
        storage.set('token', 'mock-token-' + Date.now())
        
        this.showNotification('Login berhasil! (demo mode)', 'success')
        
        setTimeout(() => {
          window.location.hash = '/'
        }, 1000)
      } else {
        this.showNotification('Email atau password salah', 'error')
      }
    }
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div')
    notification.className = `
      fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg 
      animate-slide-up ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white
    `
    notification.innerHTML = `
      <div class="flex items-center">
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} mr-2"></i>
        <span>${message}</span>
      </div>
    `
    
    document.body.appendChild(notification)
    
    setTimeout(() => {
      notification.remove()
    }, 3000)
  }

  updateCartCount() {
    // This would update the cart count in the header
    // In a real app, you'd use a state management solution
    console.log('Cart updated - implement proper state update')
  }
}

// Start the app
new FashionStoreApp()