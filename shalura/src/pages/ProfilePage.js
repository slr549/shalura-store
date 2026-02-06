import { storage } from '../utils/storage.js'

export class ProfilePage {
  constructor() {
    this.user = storage.get('user')
    this.activeTab = 'profile' // profile, security, addresses, orders
    this.formData = { ...this.user }
    this.passwordData = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
    this.addresses = this.loadAddresses()
  }

  render() {
    if (!this.user) {
      return this.renderLoginRequired()
    }

    return `
      <div class="animate-fade-in">
        <!-- Page Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold mb-2">Profil Saya</h1>
          <p class="text-gray-600 dark:text-gray-400">
            Kelola informasi profil Anda untuk pengalaman belanja yang lebih baik
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <!-- Sidebar -->
          <div class="lg:col-span-1">
            ${this.renderSidebar()}
          </div>

          <!-- Main Content -->
          <div class="lg:col-span-3">
            ${this.renderActiveTab()}
          </div>
        </div>
      </div>
    `
  }

  renderSidebar() {
    const tabs = [
      { id: 'profile', label: 'Profil', icon: 'fa-user' },
      { id: 'security', label: 'Keamanan', icon: 'fa-lock' },
      { id: 'addresses', label: 'Alamat', icon: 'fa-map-marker-alt' },
      { id: 'orders', label: 'Pesanan', icon: 'fa-shopping-bag' },
      { id: 'wishlist', label: 'Wishlist', icon: 'fa-heart' }
    ]

    return `
      <div class="card p-4 sticky top-24">
        <!-- User Info -->
        <div class="text-center mb-6">
          <div class="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-4 border-white dark:border-gray-800 shadow">
            <img 
              src="${this.user.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(this.user.name)}" 
              alt="${this.user.name}"
              class="w-full h-full object-cover"
            >
          </div>
          <h3 class="font-bold text-lg">${this.user.name}</h3>
          <p class="text-gray-500 text-sm">${this.user.email}</p>
          ${this.user.role === 'admin' ? `
            <span class="inline-block mt-2 badge-primary text-xs">
              <i class="fas fa-crown mr-1"></i>Admin
            </span>
          ` : ''}
        </div>

        <!-- Tabs -->
        <nav class="space-y-1">
          ${tabs.map(tab => `
            <button
              class="w-full flex items-center px-4 py-3 rounded-lg transition-colors text-left
                ${this.activeTab === tab.id 
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                }"
              onclick="window.profilePage?.setActiveTab('${tab.id}')"
            >
              <i class="fas ${tab.icon} mr-3 w-5 text-center"></i>
              ${tab.label}
            </button>
          `).join('')}
        </nav>

        <!-- Logout Button -->
        <div class="mt-8 pt-6 border-t dark:border-gray-700">
          <button 
            class="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            onclick="window.profilePage?.logout()"
          >
            <i class="fas fa-sign-out-alt mr-3"></i>
            Keluar
          </button>
        </div>
      </div>
    `
  }

  renderActiveTab() {
    switch (this.activeTab) {
      case 'profile': return this.renderProfileTab()
      case 'security': return this.renderSecurityTab()
      case 'addresses': return this.renderAddressesTab()
      case 'orders': return this.renderOrdersTab()
      case 'wishlist': return this.renderWishlistTab()
      default: return this.renderProfileTab()
    }
  }

  renderProfileTab() {
    return `
      <div class="card p-6">
        <h2 class="text-xl font-bold mb-6">Informasi Profil</h2>
        
        <form id="profileForm" class="space-y-6">
          <div class="flex items-center space-x-6 mb-6">
            <div class="relative">
              <div class="w-32 h-32 rounded-full overflow-hidden">
                <img 
                  id="avatarPreview"
                  src="${this.formData.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(this.formData.name)}" 
                  alt="${this.formData.name}"
                  class="w-full h-full object-cover"
                >
              </div>
              <button 
                type="button"
                class="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700"
                onclick="document.getElementById('avatarInput').click()"
              >
                <i class="fas fa-camera"></i>
              </button>
              <input 
                type="file" 
                id="avatarInput"
                class="hidden"
                accept="image/*"
                onchange="window.profilePage?.handleAvatarChange(event)"
              >
            </div>
            
            <div class="flex-1">
              <h3 class="font-bold mb-2">Foto Profil</h3>
              <p class="text-gray-600 dark:text-gray-400 text-sm">
                Unggah foto baru. Format JPG, GIF atau PNG. Maksimal 2MB.
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium mb-2">Nama Lengkap *</label>
              <input 
                type="text" 
                class="input"
                name="name"
                value="${this.formData.name}"
                required
              >
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Email *</label>
              <input 
                type="email" 
                class="input"
                name="email"
                value="${this.formData.email}"
                required
              >
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Nomor Telepon</label>
              <input 
                type="tel" 
                class="input"
                name="phone"
                value="${this.formData.phone || ''}"
                placeholder="0812-3456-7890"
              >
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Tanggal Lahir</label>
              <input 
                type="date" 
                class="input"
                name="birthDate"
                value="${this.formData.birthDate || ''}"
              >
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium mb-2">Jenis Kelamin</label>
              <div class="flex space-x-4">
                <label class="flex items-center">
                  <input 
                    type="radio" 
                    name="gender"
                    value="male"
                    class="mr-2"
                    ${this.formData.gender === 'male' ? 'checked' : ''}
                  >
                  <span>Laki-laki</span>
                </label>
                <label class="flex items-center">
                  <input 
                    type="radio" 
                    name="gender"
                    value="female"
                    class="mr-2"
                    ${this.formData.gender === 'female' ? 'checked' : ''}
                  >
                  <span>Perempuan</span>
                </label>
              </div>
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium mb-2">Bio</label>
              <textarea 
                class="input min-h-[100px]"
                name="bio"
                placeholder="Ceritakan sedikit tentang diri Anda..."
              >${this.formData.bio || ''}</textarea>
            </div>
          </div>

          <div class="flex justify-end space-x-3">
            <button 
              type="button"
              class="btn-secondary"
              onclick="window.profilePage?.resetForm()"
            >
              Batal
            </button>
            <button type="submit" class="btn-primary">
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    `
  }

  renderSecurityTab() {
    return `
      <div class="card p-6">
        <h2 class="text-xl font-bold mb-6">Keamanan Akun</h2>
        
        <form id="securityForm" class="space-y-6">
          <!-- Current Password -->
          <div>
            <label class="block text-sm font-medium mb-2">Password Saat Ini *</label>
            <input 
              type="password" 
              class="input"
              name="currentPassword"
              value="${this.passwordData.currentPassword}"
              required
            >
          </div>

          <!-- New Password -->
          <div>
            <label class="block text-sm font-medium mb-2">Password Baru *</label>
            <input 
              type="password" 
              class="input"
              name="newPassword"
              value="${this.passwordData.newPassword}"
              required
              minlength="6"
            >
            <p class="text-xs text-gray-500 mt-1">
              Minimal 6 karakter, kombinasi huruf dan angka
            </p>
          </div>

          <!-- Confirm Password -->
          <div>
            <label class="block text-sm font-medium mb-2">Konfirmasi Password Baru *</label>
            <input 
              type="password" 
              class="input"
              name="confirmPassword"
              value="${this.passwordData.confirmPassword}"
              required
            >
          </div>

          <!-- Password Strength -->
          <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 class="font-bold mb-2">Kekuatan Password</h4>
            <div class="space-y-2">
              <div class="flex items-center">
                <div class="w-3 h-3 rounded-full mr-2 ${this.checkPasswordStrength() >= 1 ? 'bg-green-500' : 'bg-gray-300'}"></div>
                <span class="text-sm">Minimal 6 karakter</span>
              </div>
              <div class="flex items-center">
                <div class="w-3 h-3 rounded-full mr-2 ${this.checkPasswordStrength() >= 2 ? 'bg-green-500' : 'bg-gray-300'}"></div>
                <span class="text-sm">Mengandung angka</span>
              </div>
              <div class="flex items-center">
                <div class="w-3 h-3 rounded-full mr-2 ${this.checkPasswordStrength() >= 3 ? 'bg-green-500' : 'bg-gray-300'}"></div>
                <span class="text-sm">Mengandung huruf besar & kecil</span>
              </div>
            </div>
          </div>

          <div class="flex justify-end">
            <button type="submit" class="btn-primary">
              Ganti Password
            </button>
          </div>
        </form>

        <!-- Security Options -->
        <div class="mt-8 pt-8 border-t dark:border-gray-700">
          <h3 class="font-bold mb-4">Pengaturan Keamanan Lainnya</h3>
          <div class="space-y-4">
            <label class="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div class="font-medium">Two-Factor Authentication</div>
                <div class="text-sm text-gray-500">Tambah lapisan keamanan ekstra</div>
              </div>
              <input type="checkbox" class="toggle">
            </label>

            <label class="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div class="font-medium">Email Notifikasi</div>
                <div class="text-sm text-gray-500">Dapatkan notifikasi via email</div>
              </div>
              <input type="checkbox" class="toggle" checked>
            </label>

            <div class="p-4 border rounded-lg">
              <div class="font-medium mb-2">Sesi Aktif</div>
              <div class="text-sm text-gray-500 mb-3">Perangkat yang sedang login:</div>
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <i class="fas fa-laptop text-gray-400 mr-3"></i>
                  <div>
                    <div>Chrome di Windows</div>
                    <div class="text-xs text-gray-500">Login: 10 Mar 2024, 14:30</div>
                  </div>
                </div>
                <button class="text-red-600 hover:text-red-700 text-sm">
                  Keluar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
  }

  renderAddressesTab() {
    return `
      <div class="card p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold">Alamat Saya</h2>
          <button 
            class="btn-primary"
            onclick="window.profilePage?.addNewAddress()"
          >
            <i class="fas fa-plus mr-2"></i>Tambah Alamat
          </button>
        </div>

        ${this.addresses.length === 0 ? this.renderNoAddresses() : this.renderAddressesList()}
      </div>
    `
  }

  renderAddressesList() {
    return `
      <div class="space-y-4">
        ${this.addresses.map((address, index) => `
          <div class="border rounded-lg p-4 hover:border-primary-500 transition-colors
            ${address.isDefault ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : ''}"
          >
            <div class="flex justify-between items-start mb-3">
              <div>
                <div class="font-bold">${address.name}</div>
                ${address.isDefault ? `
                  <span class="badge-primary text-xs">Utama</span>
                ` : ''}
              </div>
              <div class="flex space-x-2">
                <button 
                  class="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                  onclick="window.profilePage?.editAddress(${index})"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button 
                  class="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  onclick="window.profilePage?.deleteAddress(${index})"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
            
            <div class="text-gray-600 dark:text-gray-300">
              <p>${address.phone}</p>
              <p class="mt-1">${address.street}</p>
              <p>${address.city}, ${address.province} ${address.postalCode}</p>
            </div>
            
            <div class="mt-4 flex space-x-3">
              ${!address.isDefault ? `
                <button 
                  class="text-sm text-primary-600 hover:text-primary-700"
                  onclick="window.profilePage?.setDefaultAddress(${index})"
                >
                  Jadikan Alamat Utama
                </button>
              ` : ''}
              <button 
                class="text-sm text-gray-600 hover:text-gray-700"
                onclick="window.profilePage?.copyAddress(${index})"
              >
                Salin Alamat
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `
  }

  renderNoAddresses() {
    return `
      <div class="text-center py-12">
        <div class="w-24 h-24 mx-auto mb-6 text-gray-300">
          <i class="fas fa-map-marker-alt text-6xl"></i>
        </div>
        <h3 class="text-xl font-bold mb-2">Belum Ada Alamat</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          Tambahkan alamat pengiriman untuk pengalaman belanja yang lebih mudah
        </p>
        <button class="btn-primary" onclick="window.profilePage?.addNewAddress()">
          <i class="fas fa-plus mr-2"></i>Tambah Alamat Pertama
        </button>
      </div>
    `
  }

  renderOrdersTab() {
    // Simple redirect to order history
    return `
      <div class="text-center py-12">
        <div class="w-24 h-24 mx-auto mb-6 text-gray-300">
          <i class="fas fa-shopping-bag text-6xl"></i>
        </div>
        <h3 class="text-xl font-bold mb-2">Riwayat Pesanan</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          Lihat dan kelola semua pesanan Anda
        </p>
        <a href="#/orders" class="btn-primary inline-block">
          <i class="fas fa-history mr-2"></i>Lihat Riwayat Pesanan
        </a>
      </div>
    `
  }

  renderWishlistTab() {
    return `
      <div class="card p-6">
        <h2 class="text-xl font-bold mb-6">Wishlist Saya</h2>
        <div class="text-center py-12">
          <div class="w-24 h-24 mx-auto mb-6 text-gray-300">
            <i class="fas fa-heart text-6xl"></i>
          </div>
          <h3 class="text-xl font-bold mb-2">Wishlist Kosong</h3>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            Simpan produk favorit Anda ke wishlist untuk dibeli nanti
          </p>
          <a href="#/products" class="btn-primary inline-block">
            <i class="fas fa-store mr-2"></i>Jelajahi Produk
          </a>
        </div>
      </div>
    `
  }

  renderLoginRequired() {
    return `
      <div class="text-center py-20">
        <div class="w-32 h-32 mx-auto mb-6 text-gray-300">
          <i class="fas fa-user-lock text-9xl"></i>
        </div>
        <h3 class="text-2xl font-bold mb-4">Login Diperlukan</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
          Silakan login untuk mengakses halaman profil
        </p>
        <a href="#/login" class="btn-primary inline-block">
          <i class="fas fa-sign-in-alt mr-2"></i>Login Sekarang
        </a>
      </div>
    `
  }

  // Helper methods
  loadAddresses() {
    return storage.get('addresses') || [
      {
        name: 'Rumah',
        phone: '0812-3456-7890',
        street: 'Jl. Contoh No. 123',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        postalCode: '12345',
        isDefault: true
      }
    ]
  }

  checkPasswordStrength() {
    const password = this.passwordData.newPassword
    let strength = 0
    
    if (password.length >= 6) strength++
    if (/\d/.test(password)) strength++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
    
    return strength
  }

  // Public methods for template
  setActiveTab(tab) {
    this.activeTab = tab
    this.updateView()
  }

  handleAvatarChange(event) {
    const file = event.target.files[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File terlalu besar. Maksimal 2MB.')
        return
      }
      
      const reader = new FileReader()
      reader.onload = (e) => {
        document.getElementById('avatarPreview').src = e.target.result
        this.formData.avatar = e.target.result
      }
      reader.readAsDataURL(file)
    }
  }

  resetForm() {
    this.formData = { ...this.user }
    this.updateView()
  }

  async saveProfile(e) {
    e.preventDefault()
    
    const formData = new FormData(e.target)
    const updates = Object.fromEntries(formData)
    
    // Update user data
    this.user = { ...this.user, ...updates }
    storage.set('user', this.user)
    
    this.showNotification('Profil berhasil diperbarui', 'success')
  }

  async changePassword(e) {
    e.preventDefault()
    
    const formData = new FormData(e.target)
    const data = Object.fromEntries(formData)
    
    if (data.newPassword !== data.confirmPassword) {
      alert('Password baru tidak cocok!')
      return
    }
    
    // In real app, verify current password with API
    this.user.password = data.newPassword
    storage.set('user', this.user)
    
    this.passwordData = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
    
    this.showNotification('Password berhasil diubah', 'success')
    e.target.reset()
  }

  addNewAddress() {
    const address = {
      name: 'Alamat Baru',
      phone: '',
      street: '',
      city: '',
      province: '',
      postalCode: '',
      isDefault: this.addresses.length === 0
    }
    
    this.addresses.push(address)
    storage.set('addresses', this.addresses)
    this.updateView()
    this.showNotification('Alamat baru ditambahkan', 'info')
  }

  editAddress(index) {
    const address = this.addresses[index]
    const name = prompt('Nama alamat:', address.name)
    if (name) {
      this.addresses[index].name = name
      storage.set('addresses', this.addresses)
      this.updateView()
    }
  }

  deleteAddress(index) {
    if (confirm('Hapus alamat ini?')) {
      this.addresses.splice(index, 1)
      storage.set('addresses', this.addresses)
      this.updateView()
      this.showNotification('Alamat dihapus', 'info')
    }
  }

  setDefaultAddress(index) {
    this.addresses.forEach((addr, i) => {
      addr.isDefault = i === index
    })
    storage.set('addresses', this.addresses)
    this.updateView()
    this.showNotification('Alamat utama diperbarui', 'success')
  }

  copyAddress(index) {
    const address = this.addresses[index]
    const text = `${address.name}\n${address.phone}\n${address.street}\n${address.city}, ${address.province} ${address.postalCode}`
    
    navigator.clipboard.writeText(text)
      .then(() => this.showNotification('Alamat disalin ke clipboard', 'info'))
      .catch(() => alert('Gagal menyalin alamat'))
  }

  logout() {
    if (confirm('Yakin ingin logout?')) {
      storage.remove('user')
      storage.remove('token')
      window.location.hash = '/'
      location.reload()
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
      mainContent.innerHTML = this.render()
      this.attachEvents()
    }
  }

  attachEvents() {
    window.profilePage = this

    // Profile form
    const profileForm = document.getElementById('profileForm')
    if (profileForm) {
      profileForm.addEventListener('submit', (e) => this.saveProfile(e))
    }

    // Security form
    const securityForm = document.getElementById('securityForm')
    if (securityForm) {
      securityForm.addEventListener('submit', (e) => this.changePassword(e))
      
      // Update password strength in real-time
      const newPasswordInput = securityForm.querySelector('input[name="newPassword"]')
      if (newPasswordInput) {
        newPasswordInput.addEventListener('input', (e) => {
          this.passwordData.newPassword = e.target.value
          this.updateView()
        })
      }
    }
  }

  destroy() {
    delete window.profilePage
  }
}