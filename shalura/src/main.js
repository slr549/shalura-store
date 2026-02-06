import './style.css'
import { Header } from './layouts/Header.js'
import { Footer } from './layouts/Footer.js'
import { api } from './utils/api.js'
import { storage } from './utils/storage.js'

// Import Halaman User
import { ProductsPage } from './pages/ProductsPage.js'
import { ProductDetailPage } from './pages/ProductDetailPage.js'
import { CartPage } from './pages/CartPage.js'
import { CheckoutPage } from './pages/CheckoutPage.js'

// Import Halaman Admin
import { AdminDashboard } from './pages/admin/AdminDashboard.js'
import { ProductManager } from './pages/admin/ProductManager.js'

class ShaluraStoreApp {
  constructor() {
    this.currentPage = null
    this.currentPageInstance = null
    this.init()
  }

  async init() {
    console.log('🛍️ ShaluraStore App Initializing...')
    
    // Setup layout (Header & Footer)
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
          </div>
      </main>
    `)
    
    // Footer
    const footer = new Footer()
    app.insertAdjacentHTML('beforeend', footer.render())
  }

  async testApiConnection() {
    try {
      if (api && api.getCategories) {
        const categories = await api.getCategories()
        console.log('✅ API Connected! Categories:', categories.length)
      }
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
    
    // 1. Cleanup halaman sebelumnya
    if (this.currentPageInstance && this.currentPageInstance.destroy) {
      this.currentPageInstance.destroy()
      this.currentPageInstance = null
    }
    
    // 2. Tampilkan Loading
    mainContent.innerHTML = `
      <div class="flex items-center justify-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    `
    
    try {
      let content = ''
      this.currentPage = hash
      
      // 3. Logika Routing (Updated)
      if (hash === '/') {
        content = await this.renderHomePage()
      } 
      else if (hash === '/products') {
        this.currentPageInstance = new ProductsPage()
        content = await this.currentPageInstance.render()
      } 
      else if (hash.startsWith('/product/')) {
        const productId = hash.split('/')[2]
        this.currentPageInstance = new ProductDetailPage(productId)
        content = await this.currentPageInstance.render()
      } 
      else if (hash === '/cart') {
        this.currentPageInstance = new CartPage()
        content = this.currentPageInstance.render() // Asumsi render cart sync, kalau async tambahkan await
      } 
      else if (hash === '/checkout') {
        // --- ROUTE BARU: CHECKOUT ---
        this.currentPageInstance = new CheckoutPage()
        content = await this.currentPageInstance.render()
      }
      else if (hash === '/login') {
        content = await this.renderLoginPage()
      }
      // --- ROUTE BARU: ADMIN ---
      else if (hash === '/admin' || hash === '/admin/dashboard') {
        this.currentPageInstance = new AdminDashboard()
        content = await this.currentPageInstance.render()
      }
      else if (hash === '/admin/products' || hash.startsWith('/admin/products/')) {
        this.currentPageInstance = new ProductManager()
        content = await this.currentPageInstance.render()
      }
      else {
        content = this.renderNotFoundPage()
      }
      
      // 4. Render konten ke DOM
      mainContent.innerHTML = content
      
      // 5. Pasang Event Listener
      if (this.currentPageInstance && this.currentPageInstance.attachEvents) {
        this.currentPageInstance.attachEvents()
      } else {
        this.attachPageEvents()
      }

      // Update cart count setiap pindah halaman
      this.updateHeaderCartCount()
      
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

  // --- HALAMAN INTERNAL (HOME, LOGIN, 404) ---

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
        }
      ]
    }
    
    return `
      <div class="animate-fade-in">
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
              </div>
            </div>
          </div>
        </section>

        <section class="mb-16">
          <div class="flex justify-between items-center mb-8">
            <h2 class="text-3xl font-bold">Produk Unggulan</h2>
            <a href="#/products" class="text-primary-600 hover:text-primary-700 font-medium">
              Lihat Semua <i class="fas fa-arrow-right ml-1"></i>
            </a>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            ${featuredProducts.slice(0, 4).map(product => `
              <div class="product-card group cursor-pointer" onclick="window.location.hash='#/product/${product.id}'">
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
                    </div>
                    <div class="text-right">
                      <div class="font-bold text-lg text-primary-600">
                        Rp ${product.finalPrice.toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </section>
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
              <input type="email" class="input" placeholder="email@contoh.com" required>
            </div>
            
            <div class="mb-6">
              <label class="block text-gray-700 dark:text-gray-300 mb-2">Password</label>
              <input type="password" class="input" placeholder="••••••••" required>
            </div>
            
            <button type="submit" class="w-full btn-primary py-3">
              <i class="fas fa-sign-in-alt mr-2"></i>Masuk
            </button>
          </form>
          
          <div class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p class="text-center text-sm text-gray-500 mb-4">Atau gunakan akun demo:</p>
            <div class="grid grid-cols-2 gap-3">
              <button class="btn-secondary" data-demo-login="admin@store.com">
                <i class="fas fa-user-shield mr-2"></i>Admin
              </button>
              <button class="btn-secondary" data-demo-login="user@mail.com">
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
        <a href="#/" class="btn-primary inline-block">Kembali ke Home</a>
      </div>
    `
  }

  // --- EVENT HANDLERS ---

  attachPageEvents() {
    // 1. Handler Login
    const loginForm = document.getElementById('loginForm')
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault()
        const email = loginForm.querySelector('input[type="email"]').value
        const password = loginForm.querySelector('input[type="password"]').value
        this.handleLogin(email, password)
      })
    }

    // 2. Handler Demo Login
    document.querySelectorAll('[data-demo-login]').forEach(button => {
      button.addEventListener('click', (e) => {
        const email = e.target.dataset.demoLogin
        const password = email.includes('admin') ? 'admin123' : 'user123'
        this.handleLogin(email, password)
      })
    })

    // 3. Setup Cart Subscription
    import('./stores/cartStore.js')
      .then(({ cartStore }) => {
        cartStore.subscribe(() => {
          this.updateHeaderCartCount()
        })
      })
      .catch(() => {
        // Fallback jika belum ada store
      })
  }

  async handleLogin(email, password) {
    try {
      const response = await api.login(email, password)
      
      if (response.success) {
        storage.set('user', response.user)
        storage.set('token', response.token)
        this.showNotification('Login berhasil!', 'success')
        setTimeout(() => window.location.hash = '/', 1000)
      } else {
        this.showNotification('Email atau password salah', 'error')
      }
    } catch (error) {
      // Mock Login Fallback
      if ((email === 'admin@store.com' && password === 'admin123') || 
          (email === 'user@mail.com' && password === 'user123')) {
        
        const user = { 
          name: email.split('@')[0], 
          email, 
          role: email.includes('admin') ? 'admin' : 'customer' 
        }
        
        storage.set('user', user)
        storage.set('token', 'mock-token-' + Date.now())
        this.showNotification('Login berhasil! (Demo)', 'success')
        setTimeout(() => window.location.hash = '/', 1000)
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
    setTimeout(() => notification.remove(), 3000)
  }

  updateHeaderCartCount() {
    import('./stores/cartStore.js')
      .then(({ cartStore }) => {
        const cartCount = cartStore.getItemCount()
        const cartBadge = document.querySelector('header .relative span')
        if (cartBadge) {
          cartBadge.textContent = cartCount
          cartBadge.classList.toggle('hidden', cartCount === 0)
        }
      })
      .catch(() => {
        // Fallback localStorage
        const cart = storage.get('cart') || { items: [] }
        const count = cart.items.reduce((sum, item) => sum + item.quantity, 0)
        const cartBadge = document.querySelector('header .relative span')
        if (cartBadge) {
          cartBadge.textContent = count
          cartBadge.classList.toggle('hidden', count === 0)
        }
      })
  }
}

// Start the app
new ShaluraStoreApp()