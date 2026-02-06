import { storage } from '../utils/storage.js'
import { formatters } from '../utils/formatters.js'

export class OrderHistoryPage {
  constructor() {
    this.user = storage.get('user')
    this.orders = []
    this.filter = 'all' // all, pending, completed, cancelled
  }

  render() {
    this.loadOrders()

    return `
      <div class="animate-fade-in">
        <!-- Page Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold mb-2">Riwayat Pesanan</h1>
          <p class="text-gray-600 dark:text-gray-400">
            Lacak dan kelola pesanan Anda
          </p>
        </div>

        <!-- Filter Tabs -->
        <div class="flex space-x-2 mb-6 overflow-x-auto pb-2">
          ${this.renderFilterTabs()}
        </div>

        <!-- Orders List -->
        ${this.orders.length === 0 ? this.renderEmptyState() : this.renderOrdersList()}
      </div>
    `
  }

  renderFilterTabs() {
    const tabs = [
      { id: 'all', label: 'Semua', count: this.getOrderCount('all') },
      { id: 'pending', label: 'Menunggu', count: this.getOrderCount('pending') },
      { id: 'processing', label: 'Diproses', count: this.getOrderCount('processing') },
      { id: 'shipped', label: 'Dikirim', count: this.getOrderCount('shipped') },
      { id: 'completed', label: 'Selesai', count: this.getOrderCount('completed') },
      { id: 'cancelled', label: 'Dibatalkan', count: this.getOrderCount('cancelled') }
    ]

    return tabs.map(tab => `
      <button
        class="px-4 py-2 rounded-lg whitespace-nowrap transition-colors
          ${this.filter === tab.id 
            ? 'bg-primary-600 text-white' 
            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }"
        onclick="window.orderHistory?.setFilter('${tab.id}')"
      >
        ${tab.label}
        ${tab.count > 0 ? `
          <span class="ml-1 px-2 py-0.5 text-xs rounded-full
            ${this.filter === tab.id 
              ? 'bg-white/20' 
              : 'bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200'
            }">
            ${tab.count}
          </span>
        ` : ''}
      </button>
    `).join('')
  }

  renderOrdersList() {
    const filteredOrders = this.filter === 'all' 
      ? this.orders 
      : this.orders.filter(order => order.status === this.filter)

    return `
      <div class="space-y-4">
        ${filteredOrders.map(order => this.renderOrderCard(order)).join('')}
      </div>
    `
  }

  renderOrderCard(order) {
    const statusColors = {
      'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'processing': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'shipped': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'cancelled': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    }

    const statusTexts = {
      'pending': 'Menunggu Pembayaran',
      'processing': 'Diproses',
      'shipped': 'Dalam Pengiriman',
      'completed': 'Selesai',
      'cancelled': 'Dibatalkan'
    }

    return `
      <div class="card hover:shadow-lg transition-shadow">
        <!-- Order Header -->
        <div class="p-6 border-b dark:border-gray-700">
          <div class="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <div class="flex items-center space-x-4">
                <h3 class="font-bold text-lg">Order ${order.id}</h3>
                <span class="badge ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}">
                  ${statusTexts[order.status] || order.status}
                </span>
              </div>
              <p class="text-gray-600 dark:text-gray-400 text-sm mt-1">
                ${new Date(order.createdAt).toLocaleDateString('id-ID', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            
            <div class="mt-4 md:mt-0 text-right">
              <div class="text-2xl font-bold text-primary-600">
                ${formatters.currency(order.total)}
              </div>
              <div class="text-sm text-gray-500">
                ${order.items?.length || 0} item
              </div>
            </div>
          </div>
        </div>

        <!-- Order Items -->
        <div class="p-6">
          <div class="space-y-4">
            ${order.items?.slice(0, 2).map(item => `
              <div class="flex items-center">
                <div class="w-16 h-16 rounded-lg overflow-hidden mr-4">
                  <img 
                    src="${item.productImage}" 
                    alt="${item.productName}"
                    class="w-full h-full object-cover"
                  >
                </div>
                <div class="flex-1">
                  <h4 class="font-medium">${item.productName}</h4>
                  ${item.variantName ? `
                    <p class="text-sm text-gray-500">${item.variantName}</p>
                  ` : ''}
                  <p class="text-sm text-gray-500">
                    ${item.quantity} × ${formatters.currency(item.price)}
                  </p>
                </div>
                <div class="font-medium">
                  ${formatters.currency(item.price * item.quantity)}
                </div>
              </div>
            `).join('')}
            
            ${order.items?.length > 2 ? `
              <div class="text-center text-gray-500 py-2">
                +${order.items.length - 2} produk lainnya
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Order Actions -->
        <div class="p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
            <div class="text-sm">
              <span class="text-gray-600 dark:text-gray-400">Estimasi pengiriman:</span>
              <span class="font-medium ml-2">${order.estimatedDelivery || '-'}</span>
            </div>
            
            <div class="flex space-x-3">
              <button 
                class="btn-secondary text-sm"
                onclick="window.orderHistory?.viewOrderDetail('${order.id}')"
              >
                <i class="fas fa-eye mr-2"></i>Detail
              </button>
              
              ${order.status === 'pending' ? `
                <button 
                  class="btn-primary text-sm"
                  onclick="window.orderHistory?.payOrder('${order.id}')"
                >
                  <i class="fas fa-credit-card mr-2"></i>Bayar
                </button>
              ` : ''}
              
              ${order.status === 'shipped' ? `
                <button 
                  class="btn-primary text-sm"
                  onclick="window.orderHistory?.confirmDelivery('${order.id}')"
                >
                  <i class="fas fa-check mr-2"></i>Konfirmasi Terima
                </button>
              ` : ''}
              
              ${['pending', 'processing'].includes(order.status) ? `
                <button 
                  class="btn-secondary text-sm text-red-600 hover:text-red-700"
                  onclick="window.orderHistory?.cancelOrder('${order.id}')"
                >
                  <i class="fas fa-times mr-2"></i>Batalkan
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    `
  }

  renderEmptyState() {
    return `
      <div class="text-center py-20">
        <div class="w-32 h-32 mx-auto mb-6 text-gray-300">
          <i class="fas fa-inbox text-9xl"></i>
        </div>
        <h3 class="text-2xl font-bold mb-4">Belum Ada Pesanan</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
          Anda belum memiliki riwayat pesanan. Mulai berbelanja dan pesanan Anda akan muncul di sini.
        </p>
        <a href="#/products" class="btn-primary inline-block px-8 py-3">
          <i class="fas fa-store mr-2"></i>Mulai Belanja
        </a>
      </div>
    `
  }

  loadOrders() {
    const orders = storage.get('orders') || []
    // Filter by user if logged in (in real app, this would be server-side)
    this.orders = orders
      .filter(order => !this.user || order.userId === this.user.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  getOrderCount(status) {
    return status === 'all' 
      ? this.orders.length 
      : this.orders.filter(order => order.status === status).length
  }

  // Public methods for template
  setFilter(filter) {
    this.filter = filter
    this.updateView()
  }

  viewOrderDetail(orderId) {
    window.location.hash = `/order/${orderId}`
  }

  payOrder(orderId) {
    if (confirm('Lanjutkan ke pembayaran?')) {
      // In real app, redirect to payment gateway
      this.updateOrderStatus(orderId, 'processing')
      this.showNotification('Silakan selesaikan pembayaran', 'info')
    }
  }

  confirmDelivery(orderId) {
    if (confirm('Konfirmasi barang sudah diterima?')) {
      this.updateOrderStatus(orderId, 'completed')
      this.showNotification('Pesanan diselesaikan', 'success')
    }
  }

  cancelOrder(orderId) {
    if (confirm('Batalkan pesanan ini?')) {
      this.updateOrderStatus(orderId, 'cancelled')
      this.showNotification('Pesanan dibatalkan', 'info')
    }
  }

  updateOrderStatus(orderId, status) {
    const orders = storage.get('orders') || []
    const orderIndex = orders.findIndex(o => o.id === orderId)
    
    if (orderIndex !== -1) {
      orders[orderIndex].status = status
      storage.set('orders', orders)
      this.loadOrders()
      this.updateView()
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
      const container = mainContent.querySelector('[data-order-history]')
      if (container) {
        container.outerHTML = this.render()
      }
    }
  }

  attachEvents() {
    window.orderHistory = this
  }

  destroy() {
    delete window.orderHistory
  }
}