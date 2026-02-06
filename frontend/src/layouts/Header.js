import { storage } from '../utils/storage.js'

export class Header {
  constructor() {
    this.user = storage.get('user')
    this.cartCount = storage.get('cart')?.items?.reduce((total, item) => total + item.quantity, 0) || 0
  }

  render() {
    return `
      <header class="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div class="container mx-auto px-4 py-3">
          <div class="flex items-center justify-between">
            <a href="#/" class="flex items-center space-x-2 group">
              <div class="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center group-hover:bg-primary-700 transition">
                <i class="fas fa-tshirt text-white text-xl"></i>
              </div>
              <div>
                <h1 class="text-xl font-bold text-gray-900 dark:text-white">FashionStore</h1>
                <p class="text-xs text-gray-500 dark:text-gray-400">Premium Fashion</p>
              </div>
            </a>

            <nav class="hidden md:flex items-center space-x-1">
              ${this.renderNavLinks()}
              ${this.renderUserSection()}
              ${this.renderThemeToggle()}
            </nav>

            <button class="md:hidden text-gray-700 dark:text-gray-300 text-2xl" id="menuToggle">
              <i class="fas fa-bars"></i>
            </button>
          </div>

          <div class="md:hidden mt-4 hidden" id="mobileMenu">
            <div class="flex flex-col space-y-3">
              ${this.renderMobileNavLinks()}
              <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
                ${this.renderMobileUserSection()}
              </div>
            </div>
          </div>
        </div>
      </header>
    `
  }

  renderNavLinks() {
    return `
      <a href="#/" class="nav-link">Home</a>
      <a href="#/products" class="nav-link">Produk</a>
      <a href="#/categories" class="nav-link">Kategori</a>
      <a href="#/about" class="nav-link">Tentang</a>
      
      ${this.user?.role === 'admin' ? `
        <a href="#/admin" class="nav-link text-primary-600 font-medium">
          <i class="fas fa-crown mr-1"></i> Admin
        </a>
      ` : ''}

      <a href="#/cart" class="nav-link relative">
        <i class="fas fa-shopping-cart"></i>
        ${this.cartCount > 0 ? `
          <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
            ${this.cartCount}
          </span>
        ` : ''}
      </a>
    `
  }

  renderUserSection() {
    if (this.user) {
      return `
        <div class="flex items-center space-x-3 ml-4">
          <div class="flex items-center space-x-2">
            <img src="${this.user.avatar}" alt="${this.user.name}" class="w-8 h-8 rounded-full">
            <span class="text-sm font-medium">${this.user.name}</span>
          </div>
          <a href="#/logout" class="text-gray-500 hover:text-red-500 transition" title="Logout">
            <i class="fas fa-sign-out-alt"></i>
          </a>
        </div>
      `
    }
    return `
      <div class="flex items-center space-x-2 ml-4">
        <a href="#/login" class="btn-secondary">Login</a>
        <a href="#/register" class="btn-primary">Daftar</a>
      </div>
    `
  }

  renderThemeToggle() {
    return `
      <button class="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition ml-2" id="themeToggle">
        <i class="fas fa-moon"></i>
      </button>
    `
  }

  renderMobileNavLinks() {
    return `
      <a href="#/" class="nav-link">Home</a>
      <a href="#/products" class="nav-link">Produk</a>
      <a href="#/categories" class="nav-link">Kategori</a>
      <a href="#/about" class="nav-link">Tentang</a>

      ${this.user?.role === 'admin' ? `
        <a href="#/admin" class="nav-link text-primary-600 font-medium">
          <i class="fas fa-crown mr-1"></i> Admin Dashboard
        </a>
      ` : ''}

      <a href="#/cart" class="nav-link flex justify-between items-center">
        <span>Keranjang</span>
        ${this.cartCount > 0 ? `
          <span class="badge-primary">${this.cartCount} items</span>
        ` : ''}
      </a>
    `
  }

  renderMobileUserSection() {
    if (this.user) {
      return `
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <img src="${this.user.avatar}" alt="${this.user.name}" class="w-10 h-10 rounded-full">
            <div>
              <p class="font-medium">${this.user.name}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">${this.user.email}</p>
            </div>
          </div>
          <a href="#/logout" class="text-red-500">
            <i class="fas fa-sign-out-alt text-xl"></i>
          </a>
        </div>
      `
    }
    return `
      <div class="grid grid-cols-2 gap-3">
        <a href="#/login" class="btn-secondary text-center">Login</a>
        <a href="#/register" class="btn-primary text-center">Daftar</a>
      </div>
    `
  }

  attachEvents() {
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle')
    if (themeToggle) {
      const isDark = storage.get('theme') === 'dark'
      if (isDark) {
        document.documentElement.classList.add('dark')
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>'
      }

      themeToggle.addEventListener('click', () => {
        const isDark = document.documentElement.classList.toggle('dark')
        storage.set('theme', isDark ? 'dark' : 'light')
        themeToggle.innerHTML = isDark 
          ? '<i class="fas fa-sun"></i>' 
          : '<i class="fas fa-moon"></i>'
      })
    }

    // Mobile menu toggle
    const menuToggle = document.getElementById('menuToggle')
    const mobileMenu = document.getElementById('mobileMenu')
    if (menuToggle && mobileMenu) {
      menuToggle.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden')
        menuToggle.innerHTML = mobileMenu.classList.contains('hidden')
          ? '<i class="fas fa-bars"></i>'
          : '<i class="fas fa-times"></i>'
      })
    }
  }
}