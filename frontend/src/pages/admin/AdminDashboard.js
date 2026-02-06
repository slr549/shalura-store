import { api } from '../../utils/api.js'
import { storage } from '../../utils/storage.js'

export class AdminDashboard {
  constructor() {
    this.stats = null
    this.recentOrders = []
    this.loading = true
  }

  async render() {
    const user = storage.get('user')
    if (!user || user.role !== 'admin') {
      return this.renderUnauthorized()
    }

    await this.fetchDashboardData()

    return `
      <div class="animate-fade-in">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p class="text-gray-600 dark:text-gray-400">
            Selamat datang, ${user.name}! Kelola toko Anda dari sini.
          </p>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          ${this.renderStatsCards()}
        </div>

        <!-- Charts & Recent Orders -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Recent Orders -->
          <div class="lg:col-span-2">
            <div class="card p-6">
              <div class="flex justify-between items-center mb-6">
                <h3 class="font-bold text-lg">Pesanan Terbaru</h3>
                <a href="#/admin/orders" class="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  Lihat Semua <i class="fas fa-arrow-right ml-1"></i>
                </a>
              </div>
              ${this.renderRecentOrders()}
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="lg:col-span-1">
            <div class="card p-6">
              <h3 class="font-bold text-lg mb-6">Aksi Cepat</h3>
              <div class="space-y-3">
                <a href="#/admin/products/new" class="flex items-center p-3 border rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                  <div class="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mr-3">
                    <i class="fas fa-plus text-primary-600"></i>
                  </div>
                  <div>
                    <div class="font-medium">Tambah Produk</div>
                    <div class="text-sm text-gray-500">Produk baru</div>
                  </div>
                </a>

                <a href="#/admin/products" class="flex items-center p-3 border rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                  <div class="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-3">
                    <i class="fas fa-box text-green-600"></i>
                  </div>
                  <div>
                    <div class="font-medium">Kelola Produk</div>
                    <div class="text-sm text-gray-500">Edit & hapus produk</div>
                  </div>
                </a>

                <a href="#/admin/orders" class="flex items-center p-3 border rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                  <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3">
                    <i class="fas fa-shopping-cart text-blue-600"></i>
                  </div>
                  <div>
                    <div class="font-medium">Kelola Pesanan</div>
                    <div class="text-sm text-gray-500">Update status pesanan</div>
                  </div>
                </a>

                <button class="w-full flex items-center p-3 border rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors text-left">
                  <div class="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-3">
                    <i class="fas fa-chart-bar text-purple-600"></i>
                  </div>
                  <div>
                    <div class="font-medium">Laporan Penjualan</div>
                    <div class="text-sm text-gray-500">Download PDF</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
  }

  renderStatsCards() {
    if (this.loading) {
      return Array.from({ length: 4 }).map(() => `
        <div class="card p-6">
          <div class="animate-pulse">
            <div class="skeleton h-4 w-1/2 mb-4"></div>
            <div class="skeleton h-8 w-3/4"></div>
          </div>
        </div>
      `).join('')
    }

    const stats = this.stats || {
      totalSales: 0,
      totalOrders: 0,
      totalProducts: 0,
      totalCustomers: 0
    }

    const cards = [
      {
        title: 'Total Penjualan',
        value: `Rp ${stats.totalSales.toLocaleString('id-ID')}`,
        icon: 'fa-wallet',
        color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400',
        change: '+12.5%'
      },
      {
        title: 'Total Pesanan',
        value: stats.totalOrders,
        icon: 'fa-shopping-cart',
        color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
        change: '+8.2%'
      },
      {
        title: 'Total Produk',
        value: stats.totalProducts,
        icon: 'fa-box',
        color: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400',
        change: '+3.1%'
      },
      {
        title: 'Pelanggan',
        value: stats.totalCustomers,
        icon: 'fa-users',
        color: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400',
        change: '+5.7%'
      }
    ]

    return cards.map(card => `
      <div class="card p-6 hover:shadow-lg transition-shadow">
        <div class="flex items-center justify-between mb-4">
          <div class="${card.color} w-12 h-12 rounded-lg flex items-center justify-center">
            <i class="fas ${card.icon} text-xl"></i>
          </div>
          <span class="text-sm font-medium text-green-600">
            ${card.change}
          </span>
        </div>
        <div>
          <div class="text-2xl font-bold mb-1">${card.value}</div>
          <div class="text-gray-600 dark:text-gray-400">${card.title}</div>
        </div>
      </div>
    `).join('')
  }

  renderRecentOrders() {
    if (this.loading) {
      return `
        <div class="space-y-4">
          ${Array.from({ length: 5 }).map(() => `
            <div class="animate-pulse">
              <div class="skeleton h-16 rounded-lg"></div>
            </div>
          `).join('')}
        </div>
      `
    }

    if (this.recentOrders.length === 0) {
      return `
        <div class="text-center py-8">
          <i class="fas fa-inbox text-4xl text-gray-300 mb-4"></i>
          <p class="text-gray-500">Belum ada pesanan</p>
        </div>
      `
    }

    return `
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="text-left text-sm text-gray-500 border-b dark:border-gray-700">
              <th class="pb-3">Order ID</th>
              <th class="pb-3">Customer</th>
              <th class="pb-3">Total</th>
              <th class="pb-3">Status</th>
              <th class="pb-3">Tanggal</th>
            </tr>
          </thead>
          <tbody>
            ${this.recentOrders.slice(0, 5).map(order => `
              <tr class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                <td class="py-3">
                  <a href="#/admin/orders/${order.id}" class="font-medium text-primary-600 hover:underline">
                    ${order.id}
                  </a>
                </td>
                <td class="py-3">${order.customerName}</td>
                <td class="py-3">Rp ${order.total.toLocaleString('id-ID')}</td>
                <td class="py-3">
                  <span class="badge ${this.getStatusBadgeClass(order.status)}">
                    ${this.getStatusText(order.status)}
                  </span>
                </td>
                <td class="py-3 text-gray-500">${new Date(order.date).toLocaleDateString('id-ID')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `
  }

  renderUnauthorized() {
    return `
      <div class="text-center py-20">
        <div class="w-32 h-32 mx-auto mb-6 text-gray-300">
          <i class="fas fa-lock text-9xl"></i>
        </div>
        <h3 class="text-2xl font-bold mb-4">Akses Ditolak</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
          Halaman ini hanya dapat diakses oleh administrator.
        </p>
        <a href="#/login" class="btn-primary inline-block">
          <i class="fas fa-sign-in-alt mr-2"></i>Login sebagai Admin
        </a>
      </div>
    `
  }

  async fetchDashboardData() {
    try {
      // Fetch from API
      const [products, orders] = await Promise.all([
        api.getProducts(),
        this.getOrdersFromStorage()
      ])

      this.stats = {
        totalSales: orders.reduce((sum, order) => sum + order.total, 0),
        totalOrders: orders.length,
        totalProducts: products.length,
        totalCustomers: new Set(orders.map(o => o.customerId)).size
      }

      this.recentOrders = orders
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10)

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // Fallback to mock data
      this.stats = {
        totalSales: 12500000,
        totalOrders: 48,
        totalProducts: 25,
        totalCustomers: 32
      }

      this.recentOrders = this.getMockOrders()
    } finally {
      this.loading = false
    }
  }

  getOrdersFromStorage() {
    const orders = storage.get('orders') || []
    return orders.map(order => ({
      id: order.id,
      customerName: order.shipping?.nama || 'Customer',
      total: order.total,
      status: order.status || 'pending',
      date: order.createdAt
    }))
  }

  getMockOrders() {
    return [
      { id: 'ORD-1001', customerName: 'Budi Santoso', total: 450000, status: 'completed', date: '2024-03-10' },
      { id: 'ORD-1002', customerName: 'Sari Dewi', total: 289000, status: 'processing', date: '2024-03-09' },
      { id: 'ORD-1003', customerName: 'Ahmad Fauzi', total: 1250000, status: 'shipped', date: '2024-03-08' },
      { id: 'ORD-1004', customerName: 'Rina Melati', total: 345000, status: 'pending', date: '2024-03-07' },
      { id: 'ORD-1005', customerName: 'Joko Widodo', total: 899000, status: 'completed', date: '2024-03-06' }
    ]
  }

  getStatusBadgeClass(status) {
    const classes = {
      'pending': 'badge-warning',
      'processing': 'badge-primary',
      'shipped': 'badge-info',
      'completed': 'badge-success',
      'cancelled': 'badge-error'
    }
    return classes[status] || 'badge-secondary'
  }

  getStatusText(status) {
    const texts = {
      'pending': 'Menunggu',
      'processing': 'Diproses',
      'shipped': 'Dikirim',
      'completed': 'Selesai',
      'cancelled': 'Dibatalkan'
    }
    return texts[status] || status
  }

  attachEvents() {
    // Add any dashboard-specific events here
  }

  destroy() {
    // Cleanup
  }
}