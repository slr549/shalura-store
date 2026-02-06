import { productStore } from '../../stores/productStore.js'

export class ProductManager {
  constructor() {
    this.mode = 'list' // 'list', 'add', 'edit'
    this.editingId = null
    this.categories = ['Pria', 'Wanita', 'Tas', 'Sepatu', 'Aksesoris']
  }

  async render() {
    await productStore.fetchProducts()

    switch (this.mode) {
      case 'add':
      case 'edit':
        return this.renderForm()
      default:
        return this.renderList()
    }
  }

  renderList() {
    const products = productStore.products

    return `
      <div class="animate-fade-in">
        <!-- Header -->
        <div class="flex justify-between items-center mb-8">
          <div>
            <h1 class="text-3xl font-bold mb-2">Kelola Produk</h1>
            <p class="text-gray-600 dark:text-gray-400">
              ${products.length} produk ditemukan
            </p>
          </div>
          <button 
            class="btn-primary"
            onclick="window.productManager?.setMode('add')"
          >
            <i class="fas fa-plus mr-2"></i>Tambah Produk
          </button>
        </div>

        <!-- Search & Filters -->
        <div class="card p-4 mb-6">
          <div class="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
            <div class="flex-1">
              <input 
                type="text" 
                placeholder="Cari produk..."
                class="input"
                id="searchProduct"
              >
            </div>
            <div>
              <select class="input">
                <option value="">Semua Kategori</option>
                ${this.categories.map(cat => `
                  <option value="${cat}">${cat}</option>
                `).join('')}
              </select>
            </div>
            <button class="btn-secondary">
              <i class="fas fa-filter mr-2"></i>Filter
            </button>
          </div>
        </div>

        <!-- Products Table -->
        <div class="card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="bg-gray-50 dark:bg-gray-800 text-left">
                  <th class="p-4 font-medium">Produk</th>
                  <th class="p-4 font-medium">Kategori</th>
                  <th class="p-4 font-medium">Harga</th>
                  <th class="p-4 font-medium">Stok</th>
                  <th class="p-4 font-medium">Status</th>
                  <th class="p-4 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                ${products.map(product => this.renderProductRow(product)).join('')}
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="p-4 border-t dark:border-gray-700 flex justify-between items-center">
            <div class="text-sm text-gray-500">
              Menampilkan 1-${products.length} dari ${products.length}
            </div>
            <div class="flex space-x-2">
              <button class="px-3 py-1 rounded border">1</button>
              <button class="px-3 py-1 rounded border">2</button>
              <button class="px-3 py-1 rounded border">3</button>
            </div>
          </div>
        </div>
      </div>
    `
  }

  renderProductRow(product) {
    return `
      <tr class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
        <td class="p-4">
          <div class="flex items-center">
            <div class="w-12 h-12 rounded overflow-hidden mr-3">
              <img src="${product.images[0]}" alt="${product.name}" class="w-full h-full object-cover">
            </div>
            <div>
              <div class="font-medium">${product.name}</div>
              <div class="text-sm text-gray-500">${product.brand || '-'}</div>
            </div>
          </div>
        </td>
        <td class="p-4">
          <span class="badge-primary">${product.category}</span>
        </td>
        <td class="p-4">
          <div class="font-bold">Rp ${product.finalPrice.toLocaleString('id-ID')}</div>
          ${product.discount > 0 ? `
            <div class="text-sm text-gray-500 line-through">
              Rp ${product.price.toLocaleString('id-ID')}
            </div>
          ` : ''}
        </td>
        <td class="p-4">
          <span class="${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-yellow-600' : 'text-red-600'}">
            ${product.stock}
          </span>
        </td>
        <td class="p-4">
          <span class="badge ${product.featured ? 'badge-success' : 'badge-secondary'}">
            ${product.featured ? 'Unggulan' : 'Biasa'}
          </span>
        </td>
        <td class="p-4">
          <div class="flex space-x-2">
            <button 
              class="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
              onclick="window.productManager?.editProduct(${product.id})"
            >
              <i class="fas fa-edit"></i>
            </button>
            <button 
              class="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
              onclick="window.productManager?.deleteProduct(${product.id})"
            >
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `
  }

  renderForm() {
    const product = this.editingId ? 
      productStore.getProductById(this.editingId) : 
      this.getEmptyProduct()

    return `
      <div class="animate-fade-in max-w-4xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <div class="flex items-center mb-4">
            <button 
              class="btn-secondary mr-4"
              onclick="window.productManager?.setMode('list')"
            >
              <i class="fas fa-arrow-left"></i>
            </button>
            <h1 class="text-3xl font-bold">
              ${this.mode === 'add' ? 'Tambah Produk Baru' : 'Edit Produk'}
            </h1>
          </div>
          <p class="text-gray-600 dark:text-gray-400">
            Isi formulir di bawah untuk ${this.mode === 'add' ? 'menambahkan' : 'mengedit'} produk
          </p>
        </div>

        <!-- Form -->
        <form id="productForm" class="space-y-6">
          <div class="card p-6">
            <h3 class="font-bold text-lg mb-4">Informasi Dasar</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-2">Nama Produk *</label>
                <input 
                  type="text" 
                  class="input"
                  name="name"
                  value="${product.name}"
                  required
                >
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">Kategori *</label>
                <select class="input" name="category" required>
                  <option value="">Pilih Kategori</option>
                  ${this.categories.map(cat => `
                    <option value="${cat}" ${product.category === cat ? 'selected' : ''}>
                      ${cat}
                    </option>
                  `).join('')}
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">Brand</label>
                <input 
                  type="text" 
                  class="input"
                  name="brand"
                  value="${product.brand || ''}"
                >
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">SKU</label>
                <input 
                  type="text" 
                  class="input"
                  name="sku"
                  value="${product.sku || `SKU-${Date.now()}`}"
                >
              </div>
            </div>

            <div class="mt-4">
              <label class="block text-sm font-medium mb-2">Deskripsi *</label>
              <textarea 
                class="input min-h-[120px]"
                name="description"
                required
              >${product.description}</textarea>
            </div>
          </div>

          <!-- Pricing -->
          <div class="card p-6">
            <h3 class="font-bold text-lg mb-4">Harga & Stok</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium mb-2">Harga (Rp) *</label>
                <input 
                  type="number" 
                  class="input"
                  name="price"
                  value="${product.price}"
                  required
                  min="0"
                >
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">Diskon (%)</label>
                <input 
                  type="number" 
                  class="input"
                  name="discount"
                  value="${product.discount || 0}"
                  min="0"
                  max="100"
                >
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">Stok *</label>
                <input 
                  type="number" 
                  class="input"
                  name="stock"
                  value="${product.stock}"
                  required
                  min="0"
                >
              </div>
            </div>
          </div>

          <!-- Images -->
          <div class="card p-6">
            <h3 class="font-bold text-lg mb-4">Gambar Produk</h3>
            
            <div class="mb-4">
              <label class="block text-sm font-medium mb-2">URL Gambar Utama *</label>
              <input 
                type="url" 
                class="input"
                name="image1"
                value="${product.images[0] || ''}"
                placeholder="https://example.com/image.jpg"
                required
              >
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-2">URL Gambar 2</label>
                <input 
                  type="url" 
                  class="input"
                  name="image2"
                  value="${product.images[1] || ''}"
                >
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">URL Gambar 3</label>
                <input 
                  type="url" 
                  class="input"
                  name="image3"
                  value="${product.images[2] || ''}"
                >
              </div>
            </div>
          </div>

          <!-- Settings -->
          <div class="card p-6">
            <h3 class="font-bold text-lg mb-4">Pengaturan</h3>
            
            <div class="space-y-4">
              <label class="flex items-center">
                <input 
                  type="checkbox" 
                  class="mr-3"
                  name="featured"
                  ${product.featured ? 'checked' : ''}
                >
                <span>Produk Unggulan</span>
              </label>

              <label class="flex items-center">
                <input 
                  type="checkbox" 
                  class="mr-3"
                  name="active"
                  ${product.active !== false ? 'checked' : ''}
                >
                <span>Aktif (tampilkan di toko)</span>
              </label>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="flex justify-between">
            <button 
              type="button"
              class="btn-secondary"
              onclick="window.productManager?.setMode('list')"
            >
              Batal
            </button>
            <button type="submit" class="btn-primary">
              ${this.mode === 'add' ? 'Tambah Produk' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    `
  }

  getEmptyProduct() {
    return {
      name: '',
      price: 0,
      discount: 0,
      finalPrice: 0,
      stock: 0,
      description: '',
      category: '',
      brand: '',
      images: ['', '', ''],
      featured: false,
      active: true
    }
  }

  // Public methods for template
  setMode(mode) {
    this.mode = mode
    if (mode !== 'edit') {
      this.editingId = null
    }
    this.updateView()
  }

  editProduct(id) {
    this.mode = 'edit'
    this.editingId = id
    this.updateView()
  }

  async deleteProduct(id) {
    if (!confirm('Hapus produk ini?')) return

    try {
      // In real app: await api.delete(`/products/${id}`)
      const products = productStore.products.filter(p => p.id !== id)
      // Update store
      productStore.products = products
      productStore.notify()
      
      this.showNotification('Produk berhasil dihapus', 'success')
    } catch (error) {
      this.showNotification('Gagal menghapus produk', 'error')
    }
  }

  handleFormSubmit(e) {
    e.preventDefault()
    const formData = new FormData(e.target)
    const product = Object.fromEntries(formData)

    // Process images
    product.images = [
      product.image1,
      product.image2,
      product.image3
    ].filter(url => url)

    // Process numbers
    product.price = parseInt(product.price)
    product.discount = parseInt(product.discount) || 0
    product.stock = parseInt(product.stock)
    product.finalPrice = Math.round(product.price * (1 - product.discount / 100))
    product.featured = product.featured === 'on'
    product.active = product.active === 'on'

    // Add timestamp if new
    if (this.mode === 'add') {
      product.id = Date.now()
      product.createdAt = new Date().toISOString()
      product.rating = 0
      product.reviewCount = 0
    }

    // Update store
    if (this.mode === 'add') {
      productStore.products.push(product)
    } else {
      const index = productStore.products.findIndex(p => p.id == this.editingId)
      if (index !== -1) {
        productStore.products[index] = { ...productStore.products[index], ...product }
      }
    }

    productStore.notify()
    this.showNotification(
      `Produk berhasil ${this.mode === 'add' ? 'ditambahkan' : 'diperbarui'}`,
      'success'
    )
    
    this.setMode('list')
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

  updateView() {
    const mainContent = document.getElementById('main-content')
    if (mainContent) {
      mainContent.innerHTML = this.render()
      this.attachEvents()
    }
  }

  attachEvents() {
    window.productManager = this

    // Form submission
    const form = document.getElementById('productForm')
    if (form) {
      form.addEventListener('submit', (e) => this.handleFormSubmit(e))
    }
  }

  destroy() {
    delete window.productManager
  }
}