import { productStore } from '../stores/productStore.js'
import { ProductCard } from '../components/ProductCard.js'
import { productSearch } from '../utils/search.js'

export class ProductsPage {
  constructor() {
    this.unsubscribe = null
    this.products = []
    this.loading = true
    // Simpan referensi pagination jika ada
    this.pagination = { page: 1, totalPages: 1, total: 0 }
  }

  async render() {
    // 1. Fetch data awal dari store
    await productStore.fetchProducts()
    
    // 2. Setup subscription (Opsional, tergantung arsitektur Anda)
    // Jika productStore berubah, kita update filter options di search util
    this.unsubscribe = productStore.subscribe(() => {
      // Sinkronisasi data store ke search util jika perlu
      // productSearch.setProducts(productStore.products) 
      this.performSearch() 
    })

    // 3. Lakukan pencarian awal
    await this.performSearch()

    return `
      <div class="animate-fade-in">
        <div class="mb-8">
          <h1 class="text-3xl font-bold mb-2">Semua Produk</h1>
          <p class="text-gray-600 dark:text-gray-400">
            Temukan fashion terbaru dengan kualitas premium
          </p>
        </div>

        <div class="flex flex-col lg:flex-row gap-8">
          <aside class="lg:w-1/4">
            <div class="sticky top-24 space-y-6">
              
              <div class="card p-6">
                <h3 class="font-bold text-lg mb-4">Pencarian</h3>
                
                <div class="mb-6">
                  <input 
                    type="text" 
                    placeholder="Cari nama produk, brand..."
                    class="input w-full"
                    id="searchInput"
                    value="${productSearch.filters.search || ''}"
                  >
                </div>

                <div class="mb-2">
                  <label class="block text-sm font-medium mb-3">Kategori</label>
                  <div class="space-y-2" id="categoryFilter">
                    ${this.renderCategoryFilters()}
                  </div>
                </div>
              </div>

              ${this.renderAdvancedFilters()}

              <div class="card p-4">
                 <button class="w-full btn-secondary" id="resetFilters">
                  <i class="fas fa-undo mr-2"></i> Reset Semua Filter
                </button>
              </div>

            </div>
          </aside>

          <main class="lg:w-3/4">
            <div class="flex justify-between items-center mb-6">
              <div>
                <span class="text-gray-600 dark:text-gray-400">
                  Menampilkan 
                  <span class="font-semibold text-primary-600" id="resultCount">
                    ${this.products.length}
                  </span> 
                  produk
                </span>
              </div>
              
              <div class="flex items-center space-x-3">
                 <select class="input text-sm py-2" id="sortSelect">
                  <option value="newest" ${productSearch.filters.sort === 'newest' ? 'selected' : ''}>Terbaru</option>
                  <option value="price-asc" ${productSearch.filters.sort === 'price-asc' ? 'selected' : ''}>Harga: Rendah - Tinggi</option>
                  <option value="price-desc" ${productSearch.filters.sort === 'price-desc' ? 'selected' : ''}>Harga: Tinggi - Rendah</option>
                  <option value="rating" ${productSearch.filters.sort === 'rating' ? 'selected' : ''}>Rating Tertinggi</option>
                </select>
                
                <div class="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                  <button class="p-2 rounded hover:bg-white shadow-sm transition" id="viewGrid">
                    <i class="fas fa-th-large"></i>
                  </button>
                  <button class="p-2 rounded hover:bg-white shadow-sm transition" id="viewList">
                    <i class="fas fa-list"></i>
                  </button>
                </div>
              </div>
            </div>

            <div id="loadingContainer" class="${this.loading ? '' : 'hidden'}">
              ${this.renderLoading()}
            </div>

            <div id="productsContainer" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${this.loading ? 'hidden' : ''}">
              ${this.renderProducts()}
            </div>

            <div id="emptyState" class="${!this.loading && this.products.length === 0 ? '' : 'hidden'}">
              ${this.renderEmptyState()}
            </div>

            <div id="paginationContainer" class="mt-12 flex justify-center ${this.products.length > 0 ? '' : 'hidden'}">
               </div>
          </main>
        </div>
      </div>
    `
  }

  // --- RENDER HELPERS ---

  renderCategoryFilters() {
    // Mengambil kategori unik dari store atau search util
    const categories = productStore.categories || ['all', 'pria', 'wanita', 'anak']; 
    return categories.map(category => `
      <label class="flex items-center cursor-pointer group">
        <input 
          type="radio" 
          name="category" 
          value="${category}" 
          class="form-radio text-primary-600 focus:ring-primary-500"
          ${(productSearch.filters.category || 'all') === category ? 'checked' : ''}
        >
        <span class="text-sm capitalize ml-2 group-hover:text-primary-600 transition-colors">
          ${category === 'all' ? 'Semua Kategori' : category}
        </span>
      </label>
    `).join('')
  }

  renderAdvancedFilters() {
    const options = productSearch.getFilterOptions()
    
    // Fallback values untuk mencegah error jika options belum ready
    const minPrice = options.priceRange?.min || 0
    const maxPrice = options.priceRange?.max || 10000000
    const currentMin = productSearch.filters.minPrice || minPrice
    const currentMax = productSearch.filters.maxPrice || maxPrice

    return `
      <div class="card p-6">
        <h3 class="font-bold text-lg mb-4">Filter Lanjutan</h3>
        
        <div class="mb-6">
          <label class="block text-sm font-medium mb-2">
            Rentang Harga: 
            <div class="text-primary-600 font-semibold mt-1 text-xs">
              <span id="priceLabelMin">Rp ${currentMin.toLocaleString('id-ID')}</span> - 
              <span id="priceLabelMax">Rp ${currentMax.toLocaleString('id-ID')}</span>
            </div>
          </label>
          <div class="space-y-4 pt-2">
            <input 
              type="range" 
              min="${minPrice}"
              max="${maxPrice}"
              value="${currentMin}"
              class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
              id="minPriceSlider"
            >
            <input 
              type="range" 
              min="${minPrice}"
              max="${maxPrice}"
              value="${currentMax}"
              class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
              id="maxPriceSlider"
            >
          </div>
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium mb-3">Rating Minimal</label>
          <div class="flex flex-wrap gap-2">
            ${[4, 3, 2, 1].map(rating => `
              <button 
                data-rating="${rating}"
                class="filter-rating-btn px-3 py-1 rounded-lg text-sm border transition-colors
                ${productSearch.filters.rating === rating ? 'bg-primary-600 text-white border-primary-600' : 'bg-white hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700'}"
              >
                ${rating}+ <i class="fas fa-star text-xs"></i>
              </button>
            `).join('')}
            <button 
              data-rating="all"
              class="filter-rating-btn px-3 py-1 rounded-lg text-sm border transition-colors
              ${!productSearch.filters.rating ? 'bg-primary-600 text-white border-primary-600' : 'bg-white hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700'}"
            >
              Semua
            </button>
          </div>
        </div>

        ${options.brands && options.brands.length > 0 ? `
          <div class="mb-6">
            <label class="block text-sm font-medium mb-2">Brand</label>
            <div class="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
              ${options.brands.map(brand => `
                <label class="flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    class="filter-brand-checkbox rounded text-primary-600 focus:ring-primary-500"
                    value="${brand}"
                    ${productSearch.filters.brands.includes(brand) ? 'checked' : ''}
                  >
                  <span class="text-sm ml-2">${brand}</span>
                </label>
              `).join('')}
            </div>
          </div>
        ` : ''}

        ${options.colors && options.colors.length > 0 ? `
          <div class="mb-6">
            <label class="block text-sm font-medium mb-2">Warna</label>
            <div class="flex flex-wrap gap-2">
              ${options.colors.map(color => `
                <button 
                  data-color="${color}"
                  class="filter-color-btn px-3 py-1 rounded-full text-xs border transition-all
                  ${productSearch.filters.colors.includes(color) 
                    ? 'bg-primary-600 text-white border-primary-600 ring-2 ring-offset-1 ring-primary-200' 
                    : 'bg-white hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700'}"
                >
                  ${color}
                </button>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <div class="space-y-3 pt-2 border-t dark:border-gray-700">
          <label class="flex items-center justify-between cursor-pointer">
            <span class="text-sm">Stok Tersedia</span>
            <input 
              type="checkbox" 
              id="filterInStock"
              class="toggle-checkbox"
              ${productSearch.filters.inStock ? 'checked' : ''}
            >
          </label>
          
          <label class="flex items-center justify-between cursor-pointer">
            <span class="text-sm">Sedang Diskon</span>
            <input 
              type="checkbox" 
              id="filterOnSale"
              class="toggle-checkbox"
              ${productSearch.filters.onSale ? 'checked' : ''}
            >
          </label>
          
          <label class="flex items-center justify-between cursor-pointer">
            <span class="text-sm">Produk Unggulan</span>
            <input 
              type="checkbox" 
              id="filterFeatured"
              class="toggle-checkbox"
              ${productSearch.filters.featured ? 'checked' : ''}
            >
          </label>
        </div>
      </div>
    `
  }

  renderProducts() {
    return this.products.map(product => {
      const productCard = new ProductCard(product)
      return productCard.render()
    }).join('')
  }

  renderLoading() {
    return `
      <div class="space-y-6">
        ${Array.from({ length: 6 }).map(() => `
          <div class="card p-6">
            <div class="flex animate-pulse">
              <div class="skeleton w-24 h-24 rounded-lg"></div>
              <div class="ml-4 flex-1 space-y-3">
                <div class="skeleton h-4 w-3/4"></div>
                <div class="skeleton h-4 w-1/2"></div>
                <div class="skeleton h-4 w-1/4"></div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `
  }

  renderEmptyState() {
    return `
      <div class="text-center py-16">
        <div class="w-24 h-24 mx-auto mb-6 text-gray-300">
          <i class="fas fa-search text-6xl"></i>
        </div>
        <h3 class="text-xl font-bold mb-2">Produk tidak ditemukan</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          Coba ubah filter pencarian atau kata kunci
        </p>
        <button class="btn-primary" id="btn-clear-empty">
          <i class="fas fa-times mr-2"></i> Hapus Semua Filter
        </button>
      </div>
    `
  }

  // --- LOGIC & EVENTS ---

  async performSearch() {
    this.loading = true
    this.updateView() // Show loading

    // Simulasi delay kecil untuk UX loading (opsional)
    // await new Promise(r => setTimeout(r, 300))

    // Gunakan productSearch util untuk memproses data
    const result = productSearch.search()
    
    this.products = result.products
    this.pagination = {
      page: result.page,
      totalPages: result.totalPages,
      total: result.total
    }

    this.loading = false
    this.updateView() // Show results
  }

  updateView() {
    const productsContainer = document.getElementById('productsContainer')
    const loadingContainer = document.getElementById('loadingContainer')
    const emptyState = document.getElementById('emptyState')
    const resultCount = document.getElementById('resultCount')
    const paginationContainer = document.getElementById('paginationContainer')

    // Jika elemen belum ada di DOM (saat render awal), skip update
    if (!productsContainer) return

    if (this.loading) {
      loadingContainer.classList.remove('hidden')
      productsContainer.classList.add('hidden')
      emptyState.classList.add('hidden')
    } else {
      loadingContainer.classList.add('hidden')
      
      if (this.products.length > 0) {
        productsContainer.classList.remove('hidden')
        emptyState.classList.add('hidden')
        productsContainer.innerHTML = this.renderProducts()
        
        // Re-attach events ke product card yang baru dirender
        this.attachProductCardEvents()
      } else {
        productsContainer.classList.add('hidden')
        emptyState.classList.remove('hidden')
      }
    }

    if (resultCount) resultCount.textContent = this.products.length
    if (paginationContainer) {
        paginationContainer.className = `mt-12 flex justify-center ${this.products.length > 0 ? '' : 'hidden'}`
    }
  }

  attachEvents() {
    // 1. Search Text (Debounce)
    const searchInput = document.getElementById('searchInput')
    if (searchInput) {
      let timeout
      searchInput.addEventListener('input', (e) => {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          productSearch.updateFilters({ search: e.target.value })
          this.performSearch()
        }, 500)
      })
    }

    // 2. Sort Select
    const sortSelect = document.getElementById('sortSelect')
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        productSearch.updateFilters({ sort: e.target.value })
        this.performSearch()
      })
    }

    // 3. Category Radio
    document.querySelectorAll('input[name="category"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        productSearch.updateFilters({ category: e.target.value })
        this.performSearch()
      })
    })

    // 4. Price Sliders
    const minSlider = document.getElementById('minPriceSlider')
    const maxSlider = document.getElementById('maxPriceSlider')
    
    const handlePriceChange = () => {
      const min = parseInt(minSlider.value)
      const max = parseInt(maxSlider.value)
      
      // Update label UI langsung
      document.getElementById('priceLabelMin').textContent = `Rp ${min.toLocaleString('id-ID')}`
      document.getElementById('priceLabelMax').textContent = `Rp ${max.toLocaleString('id-ID')}`

      // Update filter logic
      productSearch.updateFilters({ minPrice: min, maxPrice: max })
      this.performSearch()
    }

    if (minSlider && maxSlider) {
      minSlider.addEventListener('change', handlePriceChange)
      maxSlider.addEventListener('change', handlePriceChange)
    }

    // 5. Rating Buttons (Event Delegation)
    document.querySelectorAll('.filter-rating-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const val = e.currentTarget.dataset.rating
        const rating = val === 'all' ? null : parseInt(val)
        
        productSearch.updateFilters({ rating })
        // Re-render filters untuk update status 'active' class
        this.refreshSidebarFilters() 
        this.performSearch()
      })
    })

    // 6. Brand Checkboxes
    document.querySelectorAll('.filter-brand-checkbox').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const brand = e.target.value
        this.toggleBrandFilter(brand)
      })
    })

    // 7. Color Buttons
    document.querySelectorAll('.filter-color-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const color = e.currentTarget.dataset.color
        this.toggleColorFilter(color)
      })
    })

    // 8. Quick Filters (Toggles)
    const toggles = [
      { id: 'filterInStock', key: 'inStock' },
      { id: 'filterOnSale', key: 'onSale' },
      { id: 'filterFeatured', key: 'featured' }
    ]
    toggles.forEach(t => {
      const el = document.getElementById(t.id)
      if (el) {
        el.addEventListener('change', (e) => {
          productSearch.updateFilters({ [t.key]: e.target.checked })
          this.performSearch()
        })
      }
    })

    // 9. Reset Button
    const resetBtn = document.getElementById('resetFilters')
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        productSearch.resetFilters()
        // Refresh UI secara total
        const content = document.getElementById('main-content') // Asumsi ID container utama
        if (content) this.render().then(html => {
             // Cara kasar re-render full page, idealnya update state DOM per komponen
             // Tapi untuk simplifikasi:
             document.getElementById('app').innerHTML = '' 
             // ... logic reload page 
             location.reload() // Atau panggil init() lagi
        })
        
        // Cara halus: Update value input manual & performSearch
        if (searchInput) searchInput.value = ''
        this.refreshSidebarFilters()
        this.performSearch()
      })
    }
    
    // Clear Empty State Button
    const clearEmptyBtn = document.getElementById('btn-clear-empty')
    if(clearEmptyBtn) {
        clearEmptyBtn.addEventListener('click', () => {
            productSearch.resetFilters()
            if (searchInput) searchInput.value = ''
            this.refreshSidebarFilters()
            this.performSearch()
        })
    }

    // Attach initial card events
    this.attachProductCardEvents()
  }

  attachProductCardEvents() {
    // Delay sedikit untuk memastikan DOM ready jika dipanggil sync
    setTimeout(() => {
      document.querySelectorAll('.product-card').forEach((element, index) => {
        if (this.products[index]) {
          const productCard = new ProductCard(this.products[index])
          productCard.attachEvents(element)
        }
      })
    }, 50)
  }

  // Helper untuk refresh sidebar tanpa reload seluruh halaman
  // (Berguna untuk update class 'active' pada tombol rating/warna)
  refreshSidebarFilters() {
      // Dalam implementasi nyata, idealnya menggunakan Virtual DOM atau update class manual
      // Di sini kita hanya men-trigger performSearch yang akan mengurus hasil produk,
      // sedangkan UI sidebar mungkin perlu di-update manual class-nya jika ingin responsif instan.
      // Untuk simplifikasi kode ini, kita biarkan logic render ulang di handle oleh user action berikutnya 
      // atau render ulang sebagian jika perlu.
  }

  // --- LOGIC TOGGLES ---

  toggleBrandFilter(brand) {
    const brands = [...productSearch.filters.brands]
    const index = brands.indexOf(brand)
    
    if (index === -1) brands.push(brand)
    else brands.splice(index, 1)
    
    productSearch.updateFilters({ brands })
    this.performSearch()
  }

  toggleColorFilter(color) {
    const colors = [...productSearch.filters.colors]
    const index = colors.indexOf(color)
    
    if (index === -1) colors.push(color)
    else colors.splice(index, 1)
    
    productSearch.updateFilters({ colors })
    this.performSearch()
    // Update UI active state manual jika perlu, atau re-render sidebar
    this.updateColorButtonsUI()
  }
  
  updateColorButtonsUI() {
      document.querySelectorAll('.filter-color-btn').forEach(btn => {
          const color = btn.dataset.color
          const isActive = productSearch.filters.colors.includes(color)
          if(isActive) {
              btn.className = 'filter-color-btn px-3 py-1 rounded-full text-xs border transition-all bg-primary-600 text-white border-primary-600 ring-2 ring-offset-1 ring-primary-200'
          } else {
              btn.className = 'filter-color-btn px-3 py-1 rounded-full text-xs border transition-all bg-white hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700'
          }
      })
  }

  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe()
    }
  }
}