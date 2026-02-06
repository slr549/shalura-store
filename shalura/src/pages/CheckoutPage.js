import { cartStore } from '../stores/cartStore.js'
import { storage } from '../utils/storage.js'
import { formatters } from '../utils/formatters.js'

export class CheckoutPage {
  constructor() {
    this.cart = cartStore.getCart()
    this.user = storage.get('user') || {}
    this.step = 1 // 1: Alamat, 2: Pengiriman, 3: Pembayaran, 4: Konfirmasi
    this.formData = {
      shipping: {
        nama: this.user.name || '',
        email: this.user.email || '',
        telepon: '',
        alamat: '',
        kota: '',
        provinsi: '',
        kodePos: '',
        catatan: ''
      },
      shippingMethod: 'standard',
      paymentMethod: 'transfer'
    }
  }

  render() {
    if (this.cart.items.length === 0) {
      return this.renderEmptyCart()
    }

    return `
      <div class="animate-fade-in">
        <!-- Progress Steps -->
        <div class="mb-8">
          ${this.renderProgressSteps()}
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Checkout Form -->
          <div class="lg:col-span-2">
            <div class="card p-6">
              ${this.renderCurrentStep()}
            </div>
          </div>

          <!-- Order Summary -->
          <div class="lg:col-span-1">
            ${this.renderOrderSummary()}
          </div>
        </div>
      </div>
    `
  }

  renderProgressSteps() {
    const steps = [
      { number: 1, title: 'Alamat', icon: 'fa-map-marker-alt' },
      { number: 2, title: 'Pengiriman', icon: 'fa-shipping-fast' },
      { number: 3, title: 'Pembayaran', icon: 'fa-credit-card' },
      { number: 4, title: 'Konfirmasi', icon: 'fa-check-circle' }
    ]

    return `
      <div class="flex justify-between relative">
        <!-- Progress Line -->
        <div class="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 -z-10">
          <div 
            class="h-full bg-primary-600 transition-all duration-300"
            style="width: ${((this.step - 1) / 3) * 100}%"
          ></div>
        </div>

        ${steps.map(step => `
          <div class="flex flex-col items-center">
            <div class="w-8 h-8 rounded-full flex items-center justify-center
              ${step.number <= this.step ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}
              ${step.number === this.step ? 'ring-4 ring-primary-100 dark:ring-primary-900' : ''}
              transition-all duration-300"
            >
              <i class="fas ${step.icon} text-sm"></i>
            </div>
            <span class="mt-2 text-sm font-medium ${step.number <= this.step ? 'text-primary-600' : 'text-gray-500'}">
              ${step.title}
            </span>
          </div>
        `).join('')}
      </div>
    `
  }

  renderCurrentStep() {
    switch (this.step) {
      case 1: return this.renderAddressStep()
      case 2: return this.renderShippingStep()
      case 3: return this.renderPaymentStep()
      case 4: return this.renderConfirmationStep()
      default: return this.renderAddressStep()
    }
  }

  renderAddressStep() {
    return `
      <div class="animate-slide-up">
        <h2 class="text-xl font-bold mb-6">Informasi Pengiriman</h2>
        
        <form id="addressForm" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2">Nama Lengkap *</label>
              <input 
                type="text" 
                class="input"
                name="nama"
                value="${this.formData.shipping.nama}"
                required
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-2">Email *</label>
              <input 
                type="email" 
                class="input"
                name="email"
                value="${this.formData.shipping.email}"
                required
              >
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Nomor Telepon *</label>
            <input 
              type="tel" 
              class="input"
              name="telepon"
              value="${this.formData.shipping.telepon}"
              placeholder="0812-3456-7890"
              required
            >
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Alamat Lengkap *</label>
            <textarea 
              class="input min-h-[100px]"
              name="alamat"
              required
            >${this.formData.shipping.alamat}</textarea>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2">Kota *</label>
              <input 
                type="text" 
                class="input"
                name="kota"
                value="${this.formData.shipping.kota}"
                required
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-2">Provinsi *</label>
              <input 
                type="text" 
                class="input"
                name="provinsi"
                value="${this.formData.shipping.provinsi}"
                required
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-2">Kode Pos *</label>
              <input 
                type="text" 
                class="input"
                name="kodePos"
                value="${this.formData.shipping.kodePos}"
                required
              >
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Catatan Pengiriman (Opsional)</label>
            <textarea 
              class="input min-h-[80px]"
              name="catatan"
              placeholder="Contoh: Tinggal di belakang rumah warna hijau"
            >${this.formData.shipping.catatan}</textarea>
          </div>
        </form>

        <div class="mt-8 flex justify-end">
          <button class="btn-primary" onclick="window.checkoutPage?.nextStep()">
            Lanjut ke Pengiriman <i class="fas fa-arrow-right ml-2"></i>
          </button>
        </div>
      </div>
    `
  }

  renderShippingStep() {
    const shippingMethods = [
      { id: 'standard', name: 'Reguler', price: 15000, time: '3-5 hari' },
      { id: 'express', name: 'Express', price: 35000, time: '1-2 hari' },
      { id: 'same-day', name: 'Same Day', price: 75000, time: 'Hari ini' }
    ]

    return `
      <div class="animate-slide-up">
        <h2 class="text-xl font-bold mb-6">Pilih Metode Pengiriman</h2>
        
        <div class="space-y-4">
          ${shippingMethods.map(method => `
            <label class="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:border-primary-500 transition-colors
              ${this.formData.shippingMethod === method.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : ''}"
            >
              <div class="flex items-center">
                <input 
                  type="radio" 
                  name="shippingMethod" 
                  value="${method.id}" 
                  class="mr-3"
                  ${this.formData.shippingMethod === method.id ? 'checked' : ''}
                  onchange="window.checkoutPage?.selectShippingMethod('${method.id}')"
                >
                <div>
                  <div class="font-medium">${method.name}</div>
                  <div class="text-sm text-gray-500">Estimasi: ${method.time}</div>
                </div>
              </div>
              <div class="font-bold">${formatters.currency(method.price)}</div>
            </label>
          `).join('')}
        </div>

        <div class="mt-8 flex justify-between">
          <button class="btn-secondary" onclick="window.checkoutPage?.prevStep()">
            <i class="fas fa-arrow-left mr-2"></i> Kembali
          </button>
          <button class="btn-primary" onclick="window.checkoutPage?.nextStep()">
            Lanjut ke Pembayaran <i class="fas fa-arrow-right ml-2"></i>
          </button>
        </div>
      </div>
    `
  }

  renderPaymentStep() {
    const paymentMethods = [
      { id: 'transfer', name: 'Transfer Bank', icon: 'fa-university', desc: 'BCA, Mandiri, BRI' },
      { id: 'ewallet', name: 'E-Wallet', icon: 'fa-wallet', desc: 'OVO, GoPay, Dana' },
      { id: 'cod', name: 'COD', icon: 'fa-money-bill-wave', desc: 'Bayar di Tempat' },
      { id: 'credit-card', name: 'Kartu Kredit', icon: 'fa-credit-card', desc: 'Visa, Mastercard' }
    ]

    return `
      <div class="animate-slide-up">
        <h2 class="text-xl font-bold mb-6">Pilih Metode Pembayaran</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          ${paymentMethods.map(method => `
            <label class="flex items-center p-4 border rounded-lg cursor-pointer hover:border-primary-500 transition-colors
              ${this.formData.paymentMethod === method.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : ''}"
            >
              <input 
                type="radio" 
                name="paymentMethod" 
                value="${method.id}" 
                class="mr-3"
                ${this.formData.paymentMethod === method.id ? 'checked' : ''}
                onchange="window.checkoutPage?.selectPaymentMethod('${method.id}')"
              >
              <div class="flex-1">
                <div class="flex items-center">
                  <i class="fas ${method.icon} text-primary-600 mr-3"></i>
                  <div>
                    <div class="font-medium">${method.name}</div>
                    <div class="text-sm text-gray-500">${method.desc}</div>
                  </div>
                </div>
              </div>
            </label>
          `).join('')}
        </div>

        <!-- Payment Instructions -->
        ${this.renderPaymentInstructions()}

        <div class="mt-8 flex justify-between">
          <button class="btn-secondary" onclick="window.checkoutPage?.prevStep()">
            <i class="fas fa-arrow-left mr-2"></i> Kembali
          </button>
          <button class="btn-primary" onclick="window.checkoutPage?.nextStep()">
            Review Pesanan <i class="fas fa-arrow-right ml-2"></i>
          </button>
        </div>
      </div>
    `
  }

  renderPaymentInstructions() {
    if (this.formData.paymentMethod === 'transfer') {
      return `
        <div class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 class="font-bold mb-2">Instruksi Transfer Bank:</h4>
          <div class="space-y-2 text-sm">
            <div>1. Transfer ke rekening BCA: 1234-5678-9012 (FashionStore)</div>
            <div>2. Jumlah yang harus ditransfer: <strong>${formatters.currency(this.getTotal())}</strong></div>
            <div>3. Tambahkan kode unik: <strong>${this.getTotal() % 1000}</strong></div>
            <div>4. Konfirmasi pembayaran melalui WhatsApp: 0812-3456-7890</div>
          </div>
        </div>
      `
    }
    
    if (this.formData.paymentMethod === 'cod') {
      return `
        <div class="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <h4 class="font-bold mb-2">Catatan COD:</h4>
          <div class="space-y-2 text-sm">
            <div>• Siapkan uang tunai: <strong>${formatters.currency(this.getTotal())}</strong></div>
            <div>• Biaya tambahan COD: Rp 5.000</div>
            <div>• Pastikan ada orang di alamat pengiriman</div>
          </div>
        </div>
      `
    }
    
    return ''
  }

  renderConfirmationStep() {
    const shippingMethod = {
      'standard': { name: 'Reguler', price: 15000 },
      'express': { name: 'Express', price: 35000 },
      'same-day': { name: 'Same Day', price: 75000 }
    }[this.formData.shippingMethod]

    return `
      <div class="animate-slide-up">
        <h2 class="text-xl font-bold mb-6">Konfirmasi Pesanan</h2>
        
        <!-- Order Summary -->
        <div class="mb-8">
          <h3 class="font-bold mb-4">Ringkasan Pesanan</h3>
          <div class="space-y-3">
            ${this.cart.items.map(item => `
              <div class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <div class="flex items-center">
                  <div class="w-12 h-12 rounded overflow-hidden mr-3">
                    <img src="${item.productImage}" alt="${item.productName}" class="w-full h-full object-cover">
                  </div>
                  <div>
                    <div class="font-medium">${item.productName}</div>
                    ${item.variantName ? `<div class="text-sm text-gray-500">${item.variantName}</div>` : ''}
                    <div class="text-sm text-gray-500">${item.quantity} × ${formatters.currency(item.price)}</div>
                  </div>
                </div>
                <div class="font-bold">${formatters.currency(item.price * item.quantity)}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Shipping Info -->
        <div class="mb-8">
          <h3 class="font-bold mb-4">Informasi Pengiriman</h3>
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div class="text-sm text-gray-500">Nama</div>
                <div class="font-medium">${this.formData.shipping.nama}</div>
              </div>
              <div>
                <div class="text-sm text-gray-500">Telepon</div>
                <div class="font-medium">${this.formData.shipping.telepon}</div>
              </div>
              <div class="md:col-span-2">
                <div class="text-sm text-gray-500">Alamat</div>
                <div class="font-medium">${this.formData.shipping.alamat}, ${this.formData.shipping.kota}, ${this.formData.shipping.provinsi} ${this.formData.shipping.kodePos}</div>
              </div>
              <div>
                <div class="text-sm text-gray-500">Metode Pengiriman</div>
                <div class="font-medium">${shippingMethod.name}</div>
              </div>
              <div>
                <div class="text-sm text-gray-500">Metode Pembayaran</div>
                <div class="font-medium">${this.getPaymentMethodName()}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Terms & Conditions -->
        <div class="mb-6">
          <label class="flex items-start">
            <input type="checkbox" class="mt-1 mr-3" id="agreeTerms">
            <span class="text-sm">
              Saya menyetujui <a href="#" class="text-primary-600 hover:underline">Syarat & Ketentuan</a> dan 
              <a href="#" class="text-primary-600 hover:underline">Kebijakan Privasi</a> yang berlaku.
            </span>
          </label>
        </div>

        <div class="mt-8 flex justify-between">
          <button class="btn-secondary" onclick="window.checkoutPage?.prevStep()">
            <i class="fas fa-arrow-left mr-2"></i> Kembali
          </button>
          <button class="btn-primary" onclick="window.checkoutPage?.placeOrder()">
            <i class="fas fa-check mr-2"></i> Buat Pesanan
          </button>
        </div>
      </div>
    `
  }

  renderOrderSummary() {
    const shippingCost = this.getShippingCost()
    const total = this.getTotal()

    return `
      <div class="card p-6 sticky top-24">
        <h3 class="font-bold text-lg mb-6">Ringkasan Belanja</h3>
        
        <div class="space-y-3 mb-6">
          <div class="flex justify-between">
            <span>Subtotal</span>
            <span>${formatters.currency(this.cart.total)}</span>
          </div>
          
          <div class="flex justify-between">
            <span>Biaya Pengiriman</span>
            <span>${formatters.currency(shippingCost)}</span>
          </div>
          
          <div class="border-t border-gray-200 dark:border-gray-700 pt-3">
            <div class="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span class="text-primary-600">${formatters.currency(total)}</span>
            </div>
            <p class="text-sm text-gray-500 mt-1">Termasuk PPN</p>
          </div>
        </div>

        <!-- Order Items Preview -->
        <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h4 class="font-bold mb-3">Pesanan Anda</h4>
          <div class="space-y-3 max-h-64 overflow-y-auto">
            ${this.cart.items.slice(0, 3).map(item => `
              <div class="flex items-center">
                <div class="w-10 h-10 rounded overflow-hidden mr-3">
                  <img src="${item.productImage}" alt="${item.productName}" class="w-full h-full object-cover">
                </div>
                <div class="flex-1">
                  <div class="text-sm font-medium truncate">${item.productName}</div>
                  <div class="text-xs text-gray-500">${item.quantity} × ${formatters.currency(item.price)}</div>
                </div>
              </div>
            `).join('')}
            
            ${this.cart.items.length > 3 ? `
              <div class="text-center text-sm text-gray-500">
                +${this.cart.items.length - 3} produk lainnya
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Promo Code -->
        <div class="mt-6">
          <label class="block text-sm font-medium mb-2">Kode Promo</label>
          <div class="flex">
            <input 
              type="text" 
              class="input rounded-r-none"
              placeholder="MASUKKAN KODE"
              id="promoCode"
            >
            <button class="btn-secondary rounded-l-none px-4">
              Terapkan
            </button>
          </div>
        </div>
      </div>
    `
  }

  renderEmptyCart() {
    return `
      <div class="text-center py-20">
        <div class="w-32 h-32 mx-auto mb-6 text-gray-300">
          <i class="fas fa-shopping-cart text-9xl"></i>
        </div>
        <h3 class="text-2xl font-bold mb-4">Keranjang Belanja Kosong</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
          Tambahkan produk ke keranjang terlebih dahulu untuk checkout.
        </p>
        <a href="#/products" class="btn-primary inline-block px-8 py-3">
          <i class="fas fa-store mr-2"></i>Mulai Belanja
        </a>
      </div>
    `
  }

  // Helper methods
  getShippingCost() {
    const methods = {
      'standard': 15000,
      'express': 35000,
      'same-day': 75000
    }
    return methods[this.formData.shippingMethod] || 0
  }

  getTotal() {
    return this.cart.total + this.getShippingCost()
  }

  getPaymentMethodName() {
    const names = {
      'transfer': 'Transfer Bank',
      'ewallet': 'E-Wallet',
      'cod': 'Cash on Delivery (COD)',
      'credit-card': 'Kartu Kredit'
    }
    return names[this.formData.paymentMethod] || ''
  }

  // Step navigation
  nextStep() {
    if (this.step === 1) {
      // Validate address form
      const form = document.getElementById('addressForm')
      if (!form.checkValidity()) {
        form.reportValidity()
        return
      }
      
      // Collect form data
      const formData = new FormData(form)
      this.formData.shipping = Object.fromEntries(formData)
    }
    
    if (this.step < 4) {
      this.step++
      this.updateView()
    }
  }

  prevStep() {
    if (this.step > 1) {
      this.step--
      this.updateView()
    }
  }

  selectShippingMethod(method) {
    this.formData.shippingMethod = method
    this.updateOrderSummary()
  }

  selectPaymentMethod(method) {
    this.formData.paymentMethod = method
  }

  async placeOrder() {
    const agreeTerms = document.getElementById('agreeTerms')
    if (!agreeTerms?.checked) {
      alert('Silakan setujui syarat dan ketentuan terlebih dahulu.')
      return
    }

    try {
      // Create order data
      const order = {
        id: 'ORD-' + Date.now(),
        userId: this.user.id || null,
        items: this.cart.items,
        shipping: this.formData.shipping,
        shippingMethod: this.formData.shippingMethod,
        shippingCost: this.getShippingCost(),
        paymentMethod: this.formData.paymentMethod,
        subtotal: this.cart.total,
        total: this.getTotal(),
        status: 'pending',
        createdAt: new Date().toISOString(),
        estimatedDelivery: this.getEstimatedDelivery()
      }

      // Save order to localStorage (in real app, send to API)
      const orders = storage.get('orders') || []
      orders.push(order)
      storage.set('orders', orders)

      // Clear cart
      cartStore.clearCart()

      // Show success message
      this.showOrderSuccess(order)

    } catch (error) {
      console.error('Order error:', error)
      alert('Gagal membuat pesanan. Silakan coba lagi.')
    }
  }

  getEstimatedDelivery() {
    const today = new Date()
    const days = {
      'standard': 5,
      'express': 2,
      'same-day': 1
    }[this.formData.shippingMethod] || 5
    
    today.setDate(today.getDate() + days)
    return today.toISOString().split('T')[0]
  }

  showOrderSuccess(order) {
    const modal = document.createElement('div')
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in'
    modal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-8 animate-slide-up">
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-check text-3xl text-green-600 dark:text-green-400"></i>
          </div>
          <h3 class="text-2xl font-bold mb-2">Pesanan Berhasil!</h3>
          <p class="text-gray-600 dark:text-gray-400">
            Order ID: <strong>${order.id}</strong>
          </p>
        </div>

        <div class="space-y-4 mb-6">
          <div class="flex justify-between">
            <span>Total Pembayaran</span>
            <span class="font-bold text-lg">${formatters.currency(order.total)}</span>
          </div>
          <div class="flex justify-between">
            <span>Metode Pembayaran</span>
            <span>${this.getPaymentMethodName()}</span>
          </div>
          <div class="flex justify-between">
            <span>Estimasi Pengiriman</span>
            <span>${new Date(order.estimatedDelivery).toLocaleDateString('id-ID')}</span>
          </div>
        </div>

        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
          <h4 class="font-bold mb-2">Instruksi Selanjutnya:</h4>
          <p class="text-sm">
            ${order.paymentMethod === 'transfer' 
              ? 'Silakan transfer ke rekening yang tertera di email konfirmasi.'
              : order.paymentMethod === 'cod'
              ? 'Siapkan uang tunai saat kurir datang.'
              : 'Pembayaran akan diproses secara otomatis.'}
          </p>
        </div>

        <div class="flex space-x-3">
          <a href="#/" class="btn-secondary flex-1 text-center">
            <i class="fas fa-home mr-2"></i> Beranda
          </a>
          <a href="#/orders" class="btn-primary flex-1 text-center">
            <i class="fas fa-history mr-2"></i> Lihat Pesanan
          </a>
        </div>
      </div>
    `

    document.body.appendChild(modal)

    // Close modal on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove()
        window.location.hash = '/'
      }
    })

    // Auto redirect after 10 seconds
    setTimeout(() => {
      if (modal.parentElement) {
        modal.remove()
        window.location.hash = '/'
      }
    }, 10000)
  }

  updateView() {
    const mainContent = document.getElementById('main-content')
    if (mainContent) {
      const container = mainContent.querySelector('[data-checkout-page]')
      if (container) {
        container.outerHTML = this.render()
      }
    }
  }

  updateOrderSummary() {
    const summary = document.querySelector('[data-order-summary]')
    if (summary) {
      // In a real app, we would update just the summary section
      this.updateView()
    }
  }

  attachEvents() {
    window.checkoutPage = this
  }

  destroy() {
    delete window.checkoutPage
  }
}