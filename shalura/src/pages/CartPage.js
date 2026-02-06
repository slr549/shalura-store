import { cartStore } from '../stores/cartStore.js'
import { formatters } from '../utils/formatters.js'

export class CartPage {
  constructor() {
    this.unsubscribe = null
    this.cart = { items: [], total: 0 }
  }

  render() {
    this.cart = cartStore.getCart()

    return `
      <div class="animate-fade-in">
        <!-- Page Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold mb-2">Keranjang Belanja</h1>
          <p class="text-gray-600 dark:text-gray-400">
            ${this.cart.items.length} item dalam keranjang
          </p>
        </div>

        ${this.cart.items.length === 0 ? this.renderEmptyCart() : this.renderCart()}
      </div>
    `
  }

  renderEmptyCart() {
    return `
      <div class="text-center py-20">
        <div class="w-32 h-32 mx-auto mb-6 text-gray-300">
          <i class="fas fa-shopping-cart text-9xl"></i>
        </div>
        <h3 class="text-2xl font-bold mb-4">Keranjang Kamu Kosong</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
          Tambahkan beberapa produk favoritmu ke keranjang dan kembali ke sini untuk checkout!
        </p>
        <a href="#/products" class="btn-primary inline-block px-8 py-3">
          <i class="fas fa-store mr-2"></i>Mulai Belanja
        </a>
      </div>
    `
  }

  renderCart() {
    return `
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Cart Items -->
        <div class="lg:col-span-2">
          <div class="card p-6">
            <div class="space-y-4">
              ${this.cart.items.map(item => this.renderCartItem(item)).join('')}
            </div>
          </div>

          <!-- Cart Actions -->
          <div class="mt-6 flex justify-between">
            <a href="#/products" class="btn-secondary">
              <i class="fas fa-arrow-left mr-2"></i>Lanjut Belanja
            </a>
            <button class="btn-secondary" onclick="window.cartPage?.clearCart()">
              <i class="fas fa-trash-alt mr-2"></i>Kosongkan Keranjang
            </button>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="lg:col-span-1">
          <div class="card p-6 sticky top-24">
            <h3 class="font-bold text-lg mb-6">Ringkasan Belanja</h3>
            
            <!-- Summary Details -->
            <div class="space-y-4 mb-6">
              <div class="flex justify-between">
                <span class="text-gray-600">Subtotal</span>
                <span class="font-medium">${formatters.currency(this.cart.total)}</span>
              </div>
              
              <div class="flex justify-between">
                <span class="text-gray-600">Pengiriman</span>
                <span class="font-medium text-green-600">Gratis</span>
              </div>
              
              <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div class="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span class="text-primary-600">${formatters.currency(this.cart.total)}</span>
                </div>
                <p class="text-sm text-gray-500 mt-1">Termasuk PPN</p>
              </div>
            </div>

            <!-- Checkout Button -->
            <a href="#/checkout" class="w-full btn-primary py-3 block text-center">
              <i class="fas fa-lock mr-2"></i>Lanjut ke Checkout
            </a>

            <!-- Payment Methods -->
            <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p class="text-sm text-gray-500 mb-3">Metode Pembayaran:</p>
              <div class="flex space-x-2">
                <div class="w-10 h-6 bg-blue-100 rounded flex items-center justify-center">
                  <i class="fab fa-cc-visa text-blue-600"></i>
                </div>
                <div class="w-10 h-6 bg-gray-100 rounded flex items-center justify-center">
                  <i class="fab fa-cc-mastercard text-red-600"></i>
                </div>
                <div class="w-10 h-6 bg-yellow-100 rounded flex items-center justify-center">
                  <i class="fas fa-university text-green-600"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
  }

  renderCartItem(item) {
    const totalPrice = item.price * item.quantity
    const saved = item.originalPrice - item.price

    return `
      <div class="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
        <!-- Product Image -->
        <div class="w-20 h-20 rounded-lg overflow-hidden mr-4">
          <img 
            src="${item.productImage}" 
            alt="${item.productName}"
            class="w-full h-full object-cover"
          >
        </div>

        <!-- Product Info -->
        <div class="flex-1">
          <div class="flex justify-between">
            <div>
              <h4 class="font-medium hover:text-primary-600 cursor-pointer">
                ${item.productName}
              </h4>
              ${item.variantName ? `
                <p class="text-sm text-gray-500 mt-1">${item.variantName}</p>
              ` : ''}
            </div>
            
            <div class="text-right">
              <div class="font-bold text-lg">${formatters.currency(totalPrice)}</div>
              ${saved > 0 ? `
                <div class="text-sm text-green-600">
                  Hemat ${formatters.currency(saved)}
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Quantity Controls -->
          <div class="flex items-center justify-between mt-4">
            <div class="flex items-center border rounded-lg">
              <button 
                class="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-800"
                onclick="window.cartPage?.updateQuantity(${item.id}, ${item.quantity - 1})"
              >
                <i class="fas fa-minus"></i>
              </button>
              <span class="px-4 py-1 min-w-12 text-center">${item.quantity}</span>
              <button 
                class="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-800"
                onclick="window.cartPage?.updateQuantity(${item.id}, ${item.quantity + 1})"
              >
                <i class="fas fa-plus"></i>
              </button>
            </div>

            <button 
              class="text-red-500 hover:text-red-700 transition-colors"
              onclick="window.cartPage?.removeItem(${item.id})"
            >
              <i class="fas fa-trash-alt mr-1"></i> Hapus
            </button>
          </div>
        </div>
      </div>
    `
  }

  // Methods for template
  updateQuantity(itemId, quantity) {
    cartStore.updateQuantity(itemId, quantity)
    this.updateCart()
  }

  removeItem(itemId) {
    if (confirm('Hapus produk dari keranjang?')) {
      cartStore.removeItem(itemId)
      this.updateCart()
    }
  }

  clearCart() {
    if (confirm('Kosongkan seluruh keranjang?')) {
      cartStore.clearCart()
      this.updateCart()
    }
  }

  updateCart() {
    this.cart = cartStore.getCart()
    
    // Update UI
    const mainContent = document.getElementById('main-content')
    if (mainContent) {
      const cartPage = mainContent.querySelector('[data-cart-page]')
      if (cartPage) {
        cartPage.outerHTML = this.render()
      }
    }
    
    // Update header cart count
    this.updateHeaderCartCount()
  }

  updateHeaderCartCount() {
    const cartCount = cartStore.getItemCount()
    const cartBadge = document.querySelector('header .relative span')
    if (cartBadge) {
      cartBadge.textContent = cartCount
      cartBadge.classList.toggle('hidden', cartCount === 0)
    }
  }

  attachEvents() {
    window.cartPage = this
    this.unsubscribe = cartStore.subscribe(() => {
      this.cart = cartStore.getCart()
    })
  }

  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe()
    }
    delete window.cartPage
  }
}